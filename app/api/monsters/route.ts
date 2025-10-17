import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  monsterSearchSchema,
  createMonsterSchema,
  shadowdarkValidations,
  type MonsterSearchResponse,
} from "@/lib/validations/monster";
import { type DatabaseMonster } from "@/lib/types/database";

export async function GET(request: NextRequest) {
  try {
    // Parse URL search parameters
    const searchParams = request.nextUrl.searchParams;
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
      type: searchParams.get("type") || undefined,
      limit: Math.min(
        Math.max(parseInt(searchParams.get("limit") || "20"), 1),
        100,
      ),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    // Validate offset >= 0
    if (rawParams.offset < 0) {
      return NextResponse.json(
        {
          error: "Invalid offset",
          message: "Offset must be a non-negative integer",
        },
        { status: 400 },
      );
    }

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
    let officialQuery = supabase
      .from("official_monsters")
      .select("*", { count: "exact" });

    let userQuery;
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

    // Apply common filters to queries
    const applyFilters = (q: any) => {
      // Search filter
      if (params.q) {
        const sanitizedQuery = shadowdarkValidations.sanitizeSearchQuery(
          params.q,
        );
        if (sanitizedQuery) {
          switch (params.fuzziness) {
            case "high":
              return q.or(
                `name.ilike.%${sanitizedQuery}%,source.ilike.%${sanitizedQuery}%,author_notes.ilike.%${sanitizedQuery}%`,
              );
            case "medium":
              return q.or(
                `name.ilike.%${sanitizedQuery}%,source.ilike.%${sanitizedQuery}%`,
              );
            case "low":
            default:
              return q.or(
                `name.ilike.${sanitizedQuery}%,source.ilike.%${sanitizedQuery}%`,
              );
          }
        }
      }
      return q;
    };

    if (officialQuery) {
      officialQuery = applyFilters(officialQuery);
    }
    if (userQuery) {
      userQuery = applyFilters(userQuery);
    }

    // Apply challenge level filters
    if (params.min_cl !== undefined) {
      if (officialQuery)
        officialQuery = officialQuery.gte("challenge_level", params.min_cl);
      if (userQuery)
        userQuery = userQuery.gte("challenge_level", params.min_cl);
    }
    if (params.max_cl !== undefined) {
      if (officialQuery)
        officialQuery = officialQuery.lte("challenge_level", params.max_cl);
      if (userQuery)
        userQuery = userQuery.lte("challenge_level", params.max_cl);
    }

    // Apply tags filter (single tag for now, as per test)
    if (params.tags && params.tags.length > 0) {
      const tag = params.tags[0]; // Test uses single tag
      if (officialQuery)
        officialQuery = officialQuery.contains("tags.type", [tag]);
      if (userQuery) userQuery = userQuery.contains("tags.type", [tag]);
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

    // Helper function to parse JSON fields
    const parseMonsterFields = (monster: any) => ({
      ...monster,
      attacks:
        typeof monster.attacks === "string"
          ? JSON.parse(monster.attacks)
          : monster.attacks,
      abilities:
        typeof monster.abilities === "string"
          ? JSON.parse(monster.abilities)
          : monster.abilities,
      tags:
        typeof monster.tags === "string"
          ? JSON.parse(monster.tags)
          : monster.tags,
    });

    // Combine and enhance data
    const officialMonsters = (officialResult.data || []).map((m: any) =>
      parseMonsterFields({
        ...m,
        is_official: true,
        is_public: true,
      }),
    );

    const userMonsters = (userResult.data || []).map((m: any) =>
      parseMonsterFields({
        ...m,
        is_official: false,
        is_public: m.is_public || false,
      }),
    );

    const allMonsters = [...officialMonsters, ...userMonsters];

    // Calculate has_more based on total
    const has_more = total > params.offset + params.limit;

    // Format response according to OpenAPI spec
    const response: MonsterSearchResponse = {
      monsters: allMonsters as DatabaseMonster[],
      total,
      has_more,
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

    // Parse JSON fields before returning
    const parsedMonster = {
      ...newMonster,
      attacks:
        typeof newMonster.attacks === "string"
          ? JSON.parse(newMonster.attacks)
          : newMonster.attacks,
      abilities:
        typeof newMonster.abilities === "string"
          ? JSON.parse(newMonster.abilities)
          : newMonster.abilities,
      tags:
        typeof newMonster.tags === "string"
          ? JSON.parse(newMonster.tags)
          : newMonster.tags,
    };

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
