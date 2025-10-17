import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Parse filters parameter
    const searchParams = request.nextUrl.searchParams;
    const filtersParam = searchParams.get("filters");

    let filters: any = {};
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (error) {
        return NextResponse.json(
          {
            error: "Invalid filters parameter",
            message: "Filters must be valid JSON",
          },
          { status: 400 },
        );
      }
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query for random monster
    let query = supabase.from("official_monsters").select("*");

    // Apply filters if provided
    if (filters.challenge_level) {
      query = query.eq("challenge_level", filters.challenge_level);
    }
    if (filters.min_cl) {
      query = query.gte("challenge_level", filters.min_cl);
    }
    if (filters.max_cl) {
      query = query.lte("challenge_level", filters.max_cl);
    }
    if (filters.type) {
      query = query.contains("tags.type", [filters.type]);
    }

    // Fetch all matching monsters
    const { data: monsters, error } = await query;

    if (error) {
      console.error("Error fetching monsters:", error);
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to fetch monsters",
        },
        { status: 500 },
      );
    }

    if (!monsters || monsters.length === 0) {
      return NextResponse.json(
        {
          error: "No monsters found",
          message: "No monsters match the specified filters",
        },
        { status: 404 },
      );
    }

    // Select a random monster
    const randomIndex = Math.floor(Math.random() * monsters.length);
    const randomMonster = {
      ...monsters[randomIndex],
      is_official: true,
      is_public: true,
    };

    return NextResponse.json(randomMonster, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/monsters/random:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
