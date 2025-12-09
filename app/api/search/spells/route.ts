import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  buildPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
  buildInFilter,
} from "@/lib/api/query-builder";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  tiers: z.array(z.number().int().min(1).max(5)).optional(),
  classes: z.array(z.string()).optional(),
  durations: z.array(z.string()).optional(),
  ranges: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  spellTypes: z.array(z.enum(["official", "user"])).optional(),
  favorites: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// GET /api/search/spells - Advanced search for spells
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const rawParams = {
      q: searchParams.get("q") || undefined,
      tiers: searchParams
        .get("tiers")
        ?.split(",")
        .map((t) => parseInt(t))
        .filter((t) => !isNaN(t)),
      classes: searchParams.get("classes")?.split(",").filter(Boolean),
      durations: searchParams.get("durations")?.split(",").filter(Boolean),
      ranges: searchParams.get("ranges")?.split(",").filter(Boolean),
      sources: searchParams.get("sources")?.split(",").filter(Boolean),
      spellTypes: searchParams
        .get("spellTypes")
        ?.split(",")
        .filter((t) => t === "official" || t === "user") as
        | ("official" | "user")[]
        | undefined,
      favorites: searchParams.get("favorites") === "true",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const {
      q,
      tiers,
      classes,
      durations,
      ranges,
      sources,
      spellTypes,
      favorites,
    } = validatedParams;

    // Build pagination params
    const pagination = buildPaginationParams(searchParams, 20, 100);

    // Get current user if favorites filter is requested
    let userId: string | null = null;
    if (favorites) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;

      // If favorites requested but no user, return empty results
      if (!userId) {
        const emptyMeta = buildPaginationMeta(pagination, 0);
        return NextResponse.json({
          results: [],
          pagination: emptyMeta,
          query: validatedParams,
        });
      }
    }

    let query = supabase.from("all_spells").select("*", { count: "exact" });

    // Apply search using query builder
    query = buildSearchQuery(query, q, ["name", "description"], "high");

    // Apply tier filter
    if (tiers && tiers.length > 0) {
      query = query.in("tier", tiers);
    }

    // Apply class filter
    if (classes && classes.length > 0) {
      // Build OR filters for each class - spell matches if classes array contains ANY selected class
      const orConditions = classes
        .map((className) => `classes.cs.["${className}"]`)
        .join(",");
      query = query.or(orConditions);
    }

    // Apply duration filter
    query = buildInFilter(query, "duration", durations);

    // Apply range filter
    query = buildInFilter(query, "range", ranges);

    // Apply source filter
    query = buildInFilter(query, "source", sources);

    // Apply spell type filter
    query = buildInFilter(query, "spell_type", spellTypes as string[]);

    // Filter by favorites if requested
    if (favorites && userId) {
      // Get user's favorite spell IDs
      const { data: favoriteSpells } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_type", "spell");

      const favoriteIds = favoriteSpells?.map((f) => f.item_id) || [];

      // If user has no favorites, return empty
      if (favoriteIds.length === 0) {
        const emptyMeta = buildPaginationMeta(pagination, 0);
        return NextResponse.json({
          results: [],
          pagination: emptyMeta,
          query: validatedParams,
        });
      }

      query = query.in("id", favoriteIds);
    }

    // Apply sorting
    query = query.order("tier").order("name");

    // Apply pagination
    query = query.range(
      pagination.offset,
      pagination.offset + pagination.limit - 1,
    );

    const { data, error, count } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    // Build pagination metadata
    const paginationMeta = buildPaginationMeta(pagination, count || 0);

    return NextResponse.json({
      results: data || [],
      pagination: paginationMeta,
      query: validatedParams,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
