import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/magic-items - List magic items with optional search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = await createClient();

    // Extract search parameter
    const search = searchParams.get("search");

    // Validate search parameter length
    if (search && search.length > 100) {
      return NextResponse.json(
        { error: "Search query must be less than 100 characters" },
        { status: 400 },
      );
    }

    // Build query for official_magic_items
    let query = supabase
      .from("official_magic_items")
      .select("*", { count: "exact" });

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Order by name ascending
    query = query.order("name", { ascending: true });

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Database error fetching magic items:", error);
      return NextResponse.json(
        { error: "Failed to fetch magic items" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/magic-items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
