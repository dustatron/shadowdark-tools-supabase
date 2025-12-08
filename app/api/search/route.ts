import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SearchFiltersSchema } from "@/lib/validations/search";
import { logger } from "@/lib/utils/logger";
import type {
  SearchResult,
  SearchResponse,
  SearchAllContentRow,
  ContentType,
  SourceType,
} from "@/lib/types/search";

/**
 * GET /api/search
 * Unified search across monsters, magic items, and equipment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const rawParams = {
      q: searchParams.get("q") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      includeMonsters: searchParams.get("includeMonsters") ?? undefined,
      includeMagicItems: searchParams.get("includeMagicItems") ?? undefined,
      includeEquipment: searchParams.get("includeEquipment") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    // Validate parameters
    const validationResult = SearchFiltersSchema.safeParse(rawParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues.map((issue) => ({
            code: issue.code,
            message: issue.message,
            path: issue.path.map(String),
          })),
        },
        { status: 400 },
      );
    }

    const filters = validationResult.data;

    // Create Supabase client
    const supabase = await createClient();

    // Call the search function
    const { data, error } = await supabase.rpc("search_all_content", {
      search_query: filters.q,
      source_filter: filters.source,
      include_monsters: filters.includeMonsters,
      include_magic_items: filters.includeMagicItems,
      include_equipment: filters.includeEquipment,
      result_limit: filters.limit,
    });

    if (error) {
      logger.error("Search error:", error);
      return NextResponse.json(
        { error: "Search failed", details: error.message },
        { status: 500 },
      );
    }

    // Transform database results to API response format
    const results: SearchResult[] = (data as SearchAllContentRow[]).map(
      (row) => ({
        id: row.id,
        name: row.name,
        type: row.content_type as ContentType,
        source: row.source as SourceType,
        detailUrl: row.detail_url,
        relevance: row.relevance,
        description: row.description,
      }),
    );

    const response: SearchResponse = {
      results,
      total: results.length,
      query: filters.q,
      filters: {
        source: filters.source,
        includeMonsters: filters.includeMonsters,
        includeMagicItems: filters.includeMagicItems,
        includeEquipment: filters.includeEquipment,
        limit: filters.limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Unexpected search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
