import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  traitTypes: z.array(z.string()).optional(),
  source: z.enum(["official", "community", "all"]).optional(),
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
      source: searchParams.get("source") || undefined,
      favorites: searchParams.get("favorites") === "true",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const { q, traitTypes, source, favorites, page, limit } = validatedParams;
    const offset = (page - 1) * limit;

    // Get current user for favorites
    let userId: string | null = null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id || null;

    // If favorites requested but no user, return empty results
    if (favorites && !userId) {
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

    // Determine which tables to query based on source filter
    const queryOfficial = !source || source === "official" || source === "all";
    const queryCommunity =
      !source || source === "community" || source === "all";

    const results: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      traits: { name: string; description: string }[];
      item_type: "official" | "custom";
      user_id: string | null;
      creator_name: string | null;
      created_at: string;
      updated_at: string;
    }> = [];

    // Query official magic items
    if (queryOfficial) {
      let officialQuery = supabase.from("official_magic_items").select("*");

      if (q) {
        officialQuery = officialQuery.or(
          `name.ilike.%${q}%,description.ilike.%${q}%`,
        );
      }

      if (traitTypes && traitTypes.length > 0) {
        const orConditions = traitTypes
          .map((type) => `traits.cs.[{"name":"${type}"}]`)
          .join(",");
        officialQuery = officialQuery.or(orConditions);
      }

      const { data: officialData } = await officialQuery;

      if (officialData) {
        results.push(
          ...officialData.map((item) => ({
            ...item,
            item_type: "official" as const,
            user_id: null,
            creator_name: null,
          })),
        );
      }
    }

    // Query community magic items (public user items)
    if (queryCommunity) {
      let communityQuery = supabase
        .from("user_magic_items")
        .select(
          `
          *,
          user_profiles:user_id (display_name)
        `,
        )
        .eq("is_public", true);

      if (q) {
        communityQuery = communityQuery.or(
          `name.ilike.%${q}%,description.ilike.%${q}%`,
        );
      }

      if (traitTypes && traitTypes.length > 0) {
        const orConditions = traitTypes
          .map((type) => `traits.cs.[{"name":"${type}"}]`)
          .join(",");
        communityQuery = communityQuery.or(orConditions);
      }

      const { data: communityData } = await communityQuery;

      if (communityData) {
        results.push(
          ...communityData.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            traits: item.traits,
            item_type: "custom" as const,
            user_id: item.user_id,
            creator_name:
              (item.user_profiles as { display_name: string })?.display_name ||
              null,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })),
        );
      }
    }

    // Filter by favorites if requested
    let filteredResults = results;
    if (favorites && userId) {
      const { data: favoriteMagicItems } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_type", "magic_item");

      const favoriteIds = new Set(
        favoriteMagicItems?.map((f) => f.item_id) || [],
      );

      filteredResults = results.filter((item) => favoriteIds.has(item.id));
    }

    // Sort by name
    filteredResults.sort((a, b) => a.name.localeCompare(b.name));

    // Apply pagination
    const total = filteredResults.length;
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total,
      pagination: {
        page,
        limit,
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
