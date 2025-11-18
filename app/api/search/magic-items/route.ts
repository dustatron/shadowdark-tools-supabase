import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  traitTypes: z.array(z.string()).optional(),
  favorites: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// GET /api/search/magic-items - Advanced search for magic items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const rawParams = {
      q: searchParams.get("q") || undefined,
      traitTypes: searchParams.get("traitTypes")?.split(",").filter(Boolean),
      favorites: searchParams.get("favorites") === "true",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const { q, traitTypes, favorites, page, limit } = validatedParams;
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

    let query = supabase
      .from("official_magic_items")
      .select("*", { count: "exact" });

    // Search by name or description
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Filter by trait types (e.g., "Benefit", "Curse", "Bonus", "Personality")
    if (traitTypes && traitTypes.length > 0) {
      // Build condition to check if traits JSONB array contains any objects with matching name
      const orConditions = traitTypes
        .map((type) => `traits.cs.[{"name":"${type}"}]`)
        .join(",");
      query = query.or(orConditions);
    }

    // Filter by favorites if requested
    if (favorites && userId) {
      // Get user's favorite magic item IDs
      const { data: favoriteMagicItems } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_type", "magic_item");

      const favoriteIds = favoriteMagicItems?.map((f) => f.item_id) || [];

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

    query = query.order("name").range(offset, offset + limit - 1);

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
