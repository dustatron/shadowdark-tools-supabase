import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  buildPaginationParams,
  buildPaginationMeta,
  parseJsonFields,
} from "@/lib/api/query-builder";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  minLevel: z.number().int().min(1).max(20).optional(),
  maxLevel: z.number().int().min(1).max(20).optional(),
  types: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// GET /api/search/monsters - Advanced search with full-text search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Build pagination using query builder utility
    const pagination = buildPaginationParams(searchParams);

    // Parse and validate query parameters
    const rawParams = {
      q: searchParams.get("q") || undefined,
      minLevel: searchParams.get("minLevel")
        ? parseInt(searchParams.get("minLevel")!)
        : undefined,
      maxLevel: searchParams.get("maxLevel")
        ? parseInt(searchParams.get("maxLevel")!)
        : undefined,
      types: searchParams.get("types")?.split(",").filter(Boolean),
      locations: searchParams.get("locations")?.split(",").filter(Boolean),
      sources: searchParams.get("sources")?.split(",").filter(Boolean),
      page: pagination.page,
      limit: pagination.limit,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);

    // If no search query, require at least one filter
    if (
      !validatedParams.q &&
      !validatedParams.minLevel &&
      !validatedParams.maxLevel &&
      !validatedParams.types &&
      !validatedParams.locations &&
      !validatedParams.sources
    ) {
      return NextResponse.json(
        { error: "At least one search parameter is required" },
        { status: 400 },
      );
    }

    // Use the search function with pagination from query builder
    const { data: results, error } = await supabase.rpc("search_monsters", {
      search_query: validatedParams.q || "",
      min_challenge_level: validatedParams.minLevel || 1,
      max_challenge_level: validatedParams.maxLevel || 20,
      monster_types: validatedParams.types || null,
      location_tags: validatedParams.locations || null,
      source_filter: validatedParams.sources?.[0] || null, // Only support single source filter for now
      limit_count: pagination.limit,
      offset_count: pagination.offset,
    });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    // Get total count for the same search (without limit/offset)
    const { data: allResults, error: countError } = await supabase.rpc(
      "search_monsters",
      {
        search_query: validatedParams.q || "",
        min_challenge_level: validatedParams.minLevel || 1,
        max_challenge_level: validatedParams.maxLevel || 20,
        monster_types: validatedParams.types || null,
        location_tags: validatedParams.locations || null,
        source_filter: validatedParams.sources?.[0] || null,
        limit_count: 999999,
        offset_count: 0,
      },
    );

    if (countError) {
      console.error("Count error:", countError);
    }

    const total = allResults?.length || results.length;

    // Parse JSON fields for response using query builder utility
    const parsedResults = parseJsonFields(results, [
      "attacks",
      "abilities",
      "tags",
    ]);

    // Build pagination metadata using query builder
    const paginationMeta = buildPaginationMeta(pagination, total);

    return NextResponse.json({
      results: parsedResults,
      total,
      pagination: paginationMeta,
      query: validatedParams,
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
