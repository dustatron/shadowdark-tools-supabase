import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  buildPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
  buildSortQuery,
} from "@/lib/api/query-builder";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  traitTypes: z.array(z.string()).optional(),
  source: z.enum(["official", "custom", "all"]).optional(),
  favorites: z.boolean().optional(),
  fuzziness: z.enum(["low", "medium", "high"]).optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// GET /api/search/magic-items - Advanced search for magic items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Build pagination parameters
    const pagination = buildPaginationParams(searchParams, 20, 100);

    // Parse and validate query parameters
    const rawParams = {
      q: searchParams.get("q") || undefined,
      traitTypes: searchParams.get("traitTypes")?.split(",").filter(Boolean),
      source: searchParams.get("source") || undefined,
      favorites: searchParams.get("favorites") === "true",
      fuzziness: searchParams.get("fuzziness") || "medium",
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const { q, traitTypes, source, favorites, fuzziness, sort, order } =
      validatedParams;

    // Get current user for favorites
    let userId: string | null = null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id || null;

    // If favorites requested but no user, return empty results
    if (favorites && !userId) {
      const emptyMeta = buildPaginationMeta(pagination, 0);
      return NextResponse.json({
        data: [],
        pagination: emptyMeta,
      });
    }

    // Determine which tables to query based on source filter
    const queryOfficial = !source || source === "official" || source === "all";
    const queryCommunity = !source || source === "custom" || source === "all";

    const results: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      traits: { name: string; description: string }[];
      item_type: "official" | "custom";
      user_id: string | null;
      creator_name: string | null;
      image_url: string | null;
      created_at: string;
      updated_at: string;
    }> = [];

    // Query official magic items
    if (queryOfficial) {
      let officialQuery = supabase.from("official_magic_items").select("*");

      // Apply search using query builder
      officialQuery = buildSearchQuery(
        officialQuery,
        q,
        ["name", "description"],
        fuzziness as "low" | "medium" | "high",
      );

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
            image_url: item.image_url ?? null,
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

      // Apply search using query builder
      communityQuery = buildSearchQuery(
        communityQuery,
        q,
        ["name", "description"],
        fuzziness as "low" | "medium" | "high",
      );

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
            image_url: item.image_url,
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

    // Apply sorting
    const sortField = sort || "name";
    const sortOrder = (order || "asc") as "asc" | "desc";
    filteredResults.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    // Apply pagination
    const total = filteredResults.length;
    const paginatedResults = filteredResults.slice(
      pagination.offset,
      pagination.offset + pagination.limit,
    );

    // Build pagination metadata
    const meta = buildPaginationMeta(pagination, total);

    return NextResponse.json({
      data: paginatedResults,
      pagination: meta,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: error.issues,
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
