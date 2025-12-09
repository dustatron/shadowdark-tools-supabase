import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
  buildSortQuery,
} from "@/lib/api/query-builder";

// GET /api/magic-items - List magic items with optional search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = await createClient();

    // Build pagination parameters
    const pagination = buildPaginationParams(searchParams, 20, 100);

    // Build query for official_magic_items
    let query = supabase
      .from("official_magic_items")
      .select("*", { count: "exact" });

    // Apply search filter if provided
    const searchTerm =
      searchParams.get("search") || searchParams.get("q") || undefined;
    const fuzziness = (searchParams.get("fuzziness") || "medium") as
      | "low"
      | "medium"
      | "high";
    query = buildSearchQuery(
      query,
      searchTerm,
      ["name", "description"],
      fuzziness,
    );

    // Apply sorting
    const sortField = searchParams.get("sort") || "name";
    const sortOrder = (searchParams.get("order") || "asc") as "asc" | "desc";
    query = buildSortQuery(query, sortField, sortOrder);

    // Apply pagination
    query = query.range(
      pagination.offset,
      pagination.offset + pagination.limit - 1,
    );

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Database error fetching magic items:", error);
      return NextResponse.json(
        { error: "Failed to fetch magic items" },
        { status: 500 },
      );
    }

    // Build pagination metadata
    const meta = buildPaginationMeta(pagination, count || 0);

    return NextResponse.json({
      data: data || [],
      pagination: meta,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/magic-items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
