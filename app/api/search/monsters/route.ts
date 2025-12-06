import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const offset = (validatedParams.page - 1) * validatedParams.limit;

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

    // Use the search function
    const { data: results, error } = await supabase.rpc("search_monsters", {
      search_query: validatedParams.q || "",
      min_challenge_level: validatedParams.minLevel || 1,
      max_challenge_level: validatedParams.maxLevel || 20,
      monster_types: validatedParams.types || null,
      location_tags: validatedParams.locations || null,
      source_filter: validatedParams.sources?.[0] || null, // Only support single source filter for now
      limit_count: validatedParams.limit,
      offset_count: offset,
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

    // Parse JSON fields for response
    const parsedResults = results.map((monster: any) => ({
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
    }));

    return NextResponse.json({
      results: parsedResults,
      total,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
      },
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
