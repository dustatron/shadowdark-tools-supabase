import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
} from "@/lib/api/query-builder";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;

    // Build pagination parameters
    const pagination = buildPaginationParams(searchParams);

    // Start query
    let query = supabase.from("equipment").select("*", { count: "exact" });

    // Apply search filter
    const searchTerm = searchParams.get("q") || undefined;
    query = buildSearchQuery(query, searchTerm, ["name"], "medium");

    // Apply item type filter (supports comma-separated values)
    const itemType = searchParams.get("itemType");
    if (itemType) {
      const itemTypes = itemType.split(",").filter(Boolean);
      if (itemTypes.length === 1) {
        query = query.eq("item_type", itemTypes[0]);
      } else if (itemTypes.length > 1) {
        query = query.in("item_type", itemTypes);
      }
    }

    // Apply pagination
    query = query.range(
      pagination.offset,
      pagination.offset + pagination.limit - 1,
    );

    const { data: equipment, count, error } = await query;

    if (error) {
      console.error("Error fetching equipment:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment" },
        { status: 500 },
      );
    }

    // Build pagination metadata
    const paginationMeta = buildPaginationMeta(pagination, count ?? 0);

    return NextResponse.json({
      data: equipment,
      pagination: paginationMeta,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
