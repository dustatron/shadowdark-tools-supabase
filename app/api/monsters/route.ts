import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  monsterSearchSchema,
  createMonsterSchema,
  shadowdarkValidations,
  type MonsterSearchResponse,
} from "@/lib/validations/monster";
import { type DatabaseMonster } from "@/lib/types/database";
import {
  buildPaginationParamsFromOffset,
  buildPaginationMeta,
  buildSearchQuery,
  buildRangeFilter,
  buildInFilter,
  parseJsonFields,
} from "@/lib/api/query-builder";

export async function GET(request: NextRequest) {
  try {
    // Parse URL search parameters
    const searchParams = request.nextUrl.searchParams;

    // Build pagination using query builder utility
    const pagination = buildPaginationParamsFromOffset(searchParams);

    const rawParams = {
      q: searchParams.get("q") || undefined,
      fuzziness: searchParams.get("fuzziness") || undefined,
      min_cl: searchParams.get("min_cl")
        ? parseInt(searchParams.get("min_cl")!)
        : undefined,
      max_cl: searchParams.get("max_cl")
        ? parseInt(searchParams.get("max_cl")!)
        : undefined,
      tags: searchParams.get("tags")
        ? searchParams
            .get("tags")!
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : undefined,
      speed: searchParams.get("speed")
        ? searchParams
            .get("speed")!
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : undefined,
      alignment: searchParams.get("alignment")
        ? searchParams
            .get("alignment")!
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a)
        : undefined,
      type: searchParams.get("type") || undefined,
      limit: pagination.limit,
      offset: pagination.offset,
    };

    // Validate query parameters
    const validationResult = monsterSearchSchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          message: "One or more query parameters are invalid",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const params = validationResult.data;

    // Validate challenge level range
    if (
      params.min_cl !== undefined &&
      params.max_cl !== undefined &&
      params.min_cl > params.max_cl
    ) {
      return NextResponse.json(
        {
          error: "Invalid challenge level range",
          message: "min_cl must be less than or equal to max_cl",
        },
        { status: 400 },
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    // Build queries for official and user monsters
    let officialQuery: any = supabase
      .from("official_monsters")
      .select("*", { count: "exact" });

    let userQuery: any;
    if (params.type === "official") {
      userQuery = null;
    } else if (params.type === "custom") {
      officialQuery = null;
      if (isAuthenticated) {
        // Authenticated: show user's own monsters (both public and private)
        userQuery = supabase
          .from("user_monsters")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);
      } else {
        // Not authenticated: show only public custom monsters
        userQuery = supabase
          .from("user_monsters")
          .select("*", { count: "exact" })
          .eq("is_public", true);
      }
    } else if (params.type === "public") {
      officialQuery = null;
      userQuery = supabase
        .from("user_monsters")
        .select("*", { count: "exact" })
        .eq("is_public", true);
    } else {
      // Default: official + (public user or own if authenticated)
      officialQuery = supabase
        .from("official_monsters")
        .select("*", { count: "exact" });
      if (isAuthenticated) {
        userQuery = supabase
          .from("user_monsters")
          .select("*", { count: "exact" })
          .or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        userQuery = supabase
          .from("user_monsters")
          .select("*", { count: "exact" })
          .eq("is_public", true);
      }
    }

    // Apply common filters to queries using query builder utilities
    const applyFilters = (q: any) => {
      // Search filter using query builder
      const searchFields =
        params.fuzziness === "high"
          ? ["name", "source", "author_notes"]
          : ["name", "source"];
      q = buildSearchQuery(q, params.q, searchFields, params.fuzziness);

      // Challenge level filters using query builder
      q = buildRangeFilter(q, "challenge_level", params.min_cl, params.max_cl);

      return q;
    };

    if (officialQuery) {
      officialQuery = applyFilters(officialQuery);
    }
    if (userQuery) {
      userQuery = applyFilters(userQuery);
    }

    // Apply tags filter - support multiple tags with OR logic
    if (params.tags && params.tags.length > 0) {
      // For a single tag, use contains on the nested JSONB structure
      // For multiple tags, build OR conditions
      if (params.tags.length === 1) {
        const tag = params.tags[0];
        if (officialQuery) {
          officialQuery = officialQuery.contains("tags", { type: [tag] });
        }
        if (userQuery) {
          userQuery = userQuery.contains("tags", { type: [tag] });
        }
      } else {
        // Build OR conditions for multiple tags
        const tagConditions = params.tags
          .map((tag) => `tags.cs.{"type":["${tag}"]}`)
          .join(",");

        if (officialQuery) {
          officialQuery = officialQuery.or(tagConditions);
        }
        if (userQuery) {
          userQuery = userQuery.or(tagConditions);
        }
      }
    }

    // Apply speed filter using query builder
    if (officialQuery) {
      officialQuery = buildInFilter(officialQuery, "speed", params.speed);
    }
    if (userQuery) {
      userQuery = buildInFilter(userQuery, "speed", params.speed);
    }

    // Apply alignment filter using query builder
    if (officialQuery) {
      officialQuery = buildInFilter(
        officialQuery,
        "alignment",
        params.alignment,
      );
    }
    if (userQuery) {
      userQuery = buildInFilter(userQuery, "alignment", params.alignment);
    }

    // Apply sorting
    if (officialQuery)
      officialQuery = officialQuery.order("name", { ascending: true });
    if (userQuery) userQuery = userQuery.order("name", { ascending: true });

    // Execute queries with pagination and get counts
    const [officialResult, userResult] = await Promise.all([
      officialQuery
        ? officialQuery.range(params.offset, params.offset + params.limit - 1)
        : Promise.resolve({ data: [], count: 0, error: null }),
      userQuery
        ? userQuery.range(params.offset, params.offset + params.limit - 1)
        : Promise.resolve({ data: [], count: 0, error: null }),
    ]);

    const totalOfficial = officialResult.count || 0;
    const totalUser = userResult.count || 0;
    const total = totalOfficial + totalUser;

    if (officialResult.error) {
      console.error("Official query error:", officialResult.error);
    }
    if (userResult.error) {
      console.error("User query error:", userResult.error);
    }

    // Combine and enhance data using query builder utility
    const officialMonsters = parseJsonFields(
      (officialResult.data || []).map((m: any) => ({
        ...m,
        is_official: true,
        is_public: true,
      })),
      ["attacks", "abilities", "tags"],
    );

    const userMonsters = parseJsonFields(
      (userResult.data || []).map((m: any) => ({
        ...m,
        is_official: false,
        is_public: m.is_public || false,
      })),
      ["attacks", "abilities", "tags"],
    );

    const allMonsters = [...officialMonsters, ...userMonsters];

    // Build pagination metadata using query builder
    const paginationMeta = buildPaginationMeta(pagination, total);

    // Format response according to OpenAPI spec
    const response: MonsterSearchResponse = {
      monsters: allMonsters as DatabaseMonster[],
      total,
      has_more: paginationMeta.hasMore,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/monsters:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
      },
      { status: 500 },
    );
  }
}

// POST handler for creating custom monsters
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to create monsters",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = createMonsterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid monster data provided",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const monsterData = validationResult.data;

    // Insert monster into user_monsters table
    const { data: newMonster, error: insertError } = await supabase
      .from("user_monsters")
      .insert({
        ...monsterData,
        user_id: user.id,
        is_public: monsterData.is_public ?? false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating monster:", insertError);
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to create monster",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    // Parse JSON fields before returning using query builder utility
    const [parsedMonster] = parseJsonFields(
      [newMonster],
      ["attacks", "abilities", "tags"],
    );

    return NextResponse.json(parsedMonster, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/monsters:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while creating the monster",
      },
      { status: 500 },
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "PUT method not supported on this endpoint",
    },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "DELETE method not supported on this endpoint",
    },
    { status: 405 },
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "PATCH method not supported on this endpoint",
    },
    { status: 405 },
  );
}
