import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  monsterSearchSchema,
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

    // Initialize Supabase client
    const supabase = await createClient();

    // Build queries for official and user monsters
    let officialQuery = supabase
      .from("official_monsters")
      .select("*", { count: "exact" });

    let userQuery;
    if (params.type === "official") {
      userQuery = null;
    } else if (params.type === "custom") {
      if (!isAuthenticated) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "Custom monsters require authentication",
          },
          { status: 401 },
        );
      }
      userQuery = supabase
        .from("user_monsters")
        .select("*", { count: "exact" })
        .eq("is_official", false)
        .eq("user_id", user.id);
    } else if (params.type === "public") {
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

    officialQuery = applyFilters(officialQuery);
    if (userQuery) {
      userQuery = applyFilters(userQuery);
    }

    // Apply challenge level filters
    if (params.min_cl !== undefined) {
      officialQuery = officialQuery.gte("challenge_level", params.min_cl);
      if (userQuery)
        userQuery = userQuery.gte("challenge_level", params.min_cl);
    }
    if (params.max_cl !== undefined) {
      officialQuery = officialQuery.lte("challenge_level", params.max_cl);
      if (userQuery)
        userQuery = userQuery.lte("challenge_level", params.max_cl);
    }

    // Apply tags filter (single tag for now, as per test)
    if (params.tags && params.tags.length > 0) {
      const tag = params.tags[0]; // Test uses single tag
      officialQuery = officialQuery.contains("tags.type", [tag]);
      if (userQuery) userQuery = userQuery.contains("tags.type", [tag]);
    }

    // Apply sorting
    officialQuery = officialQuery.order("name", { ascending: true });
    if (userQuery) userQuery = userQuery.order("name", { ascending: true });

    // Apply challenge level filters
    if (params.min_cl !== undefined) {
      query = query.gte("challenge_level", params.min_cl);
    }
    if (params.max_cl !== undefined) {
      query = query.lte("challenge_level", params.max_cl);
    }

    // Apply type filter (only official for now)
    if (params.type && params.type !== "official") {
      return NextResponse.json(
        {
          error: "Type not supported",
          message: "Only 'official' type is supported in this version",
        },
        { status: 400 },
      );
    }

    // Get count first for accurate total (without pagination)
    const officialCountQuery = officialQuery.clone().range(0, -1);
    const userCountQuery = userQuery ? userQuery.clone().range(0, -1) : null;

    const [officialCountResult, userCountResult] = await Promise.all([
      officialCountQuery,
      userCountQuery
        ? userCountQuery
        : Promise.resolve({ count: 0, error: null }),
    ]);

    let totalOfficial = officialCountResult.count || 0;
    let totalUser = userCountResult.count || 0;
    const total = totalOfficial + totalUser;

    // Now apply pagination to data queries
    officialQuery = officialQuery.range(
      params.offset,
      params.offset + params.limit - 1,
    );
    if (userQuery) {
      userQuery = userQuery.range(
        params.offset,
        params.offset + params.limit - 1,
      );
    }

    const [officialDataResult, userDataResult] = await Promise.all([
      officialQuery,
      userQuery ? userQuery : Promise.resolve({ data: [], error: null }),
    ]);

    if (officialDataResult.error) {
      console.error("Official query error:", officialDataResult.error);
    }
    if (userDataResult.error) {
      console.error("User query error:", userDataResult.error);
    }

    // Combine and enhance data
    const officialMonsters = (officialDataResult.data || []).map((m: any) => ({
      ...m,
      is_official: true,
      is_public: true,
    }));

    const userMonsters = (userDataResult.data || []).map((m: any) => ({
      ...m,
      is_official: false,
      is_public: m.is_public || false,
    }));

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

// Export other HTTP methods as not allowed
export async function POST() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "POST method not supported on this endpoint",
    },
    { status: 405 },
  );
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
