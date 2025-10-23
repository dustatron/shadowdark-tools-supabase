import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/search/filters - Get available filter options
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all unique values for filter options
    const [
      { data: typeData, error: typeError },
      { data: locationData, error: locationError },
      { data: sourceData, error: sourceError },
    ] = await Promise.all([
      // Get monster types from tag_types table
      supabase.from("tag_types").select("name").order("name"),

      // Get locations from tag_locations table
      supabase.from("tag_locations").select("name").order("name"),

      // Get unique sources from monsters
      supabase.from("all_monsters").select("source").order("source"),
    ]);

    if (typeError || locationError || sourceError) {
      console.error("Database error:", {
        typeError,
        locationError,
        sourceError,
      });
      return NextResponse.json(
        { error: "Failed to fetch filter options" },
        { status: 500 },
      );
    }

    // Extract unique values
    const types = typeData?.map((t) => t.name) || [];
    const locations = locationData?.map((l) => l.name) || [];
    const sources = [
      ...new Set(sourceData?.map((s) => s.source).filter(Boolean)),
    ];

    // Challenge level range (1-20 for Shadowdark)
    const challengeLevels = Array.from({ length: 20 }, (_, i) => i + 1);

    return NextResponse.json({
      filters: {
        challengeLevels: {
          min: 1,
          max: 20,
          options: challengeLevels,
        },
        types: types.sort(),
        locations: locations.sort(),
        sources: sources.sort(),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
