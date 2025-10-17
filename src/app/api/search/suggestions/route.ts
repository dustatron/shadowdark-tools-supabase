import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/search/suggestions - Get search suggestions/autocomplete
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q");
    const limit = Math.min(
      10,
      Math.max(1, parseInt(searchParams.get("limit") || "5")),
    );

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
      });
    }

    // Get monster name suggestions using fuzzy matching
    const { data: monsters, error } = await supabase
      .from("all_monsters")
      .select("name")
      .ilike("name", `%${query}%`)
      .limit(limit)
      .order("name");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch suggestions" },
        { status: 500 },
      );
    }

    // Extract unique names and sort by relevance
    const suggestions = monsters
      .map((monster) => monster.name)
      .filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
      .sort((a, b) => {
        // Sort by how early the query appears in the name
        const aIndex = a.toLowerCase().indexOf(query.toLowerCase());
        const bIndex = b.toLowerCase().indexOf(query.toLowerCase());

        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        // If same position, sort by length (shorter names first)
        return a.length - b.length;
      })
      .slice(0, limit);

    return NextResponse.json({
      suggestions,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
