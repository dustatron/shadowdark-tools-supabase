import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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
    const { searchParams } = new URL(request.url);

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
      page,
      limit,
    } = validatedParams;
    const offset = (page - 1) * limit;

    // Get current user if favorites filter is requested
    let userId: string | null = null;
    if (favorites) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;

      // If favorites requested but no user, return empty results
      if (!userId) {
        return NextResponse.json({
          results: [],
          total: 0,
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
          query: validatedParams,
        });
      }
    }

    let query = supabase.from("all_spells").select("*", { count: "exact" });

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (tiers && tiers.length > 0) {
      query = query.in("tier", tiers);
    }
    if (classes && classes.length > 0) {
      // Build OR filters for each class - spell matches if classes array contains ANY selected class
      const orConditions = classes
        .map((className) => `classes.cs.["${className}"]`)
        .join(",");
      query = query.or(orConditions);
    }
    if (durations && durations.length > 0) {
      query = query.in("duration", durations);
    }
    if (ranges && ranges.length > 0) {
      query = query.in("range", ranges);
    }
    if (sources && sources.length > 0) {
      query = query.in("source", sources);
    }
    if (spellTypes && spellTypes.length > 0) {
      query = query.in("spell_type", spellTypes);
    }

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
        return NextResponse.json({
          results: [],
          total: 0,
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
          query: validatedParams,
        });
      }

      query = query.in("id", favoriteIds);
    }

    query = query
      .order("tier")
      .order("name")
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    const total = count || 0;

    return NextResponse.json({
      results: data || [],
      total,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
