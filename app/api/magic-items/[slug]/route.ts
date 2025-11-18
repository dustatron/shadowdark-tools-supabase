import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Slug validation regex (lowercase letters, numbers, hyphens, underscores)
const SLUG_REGEX = /^[a-z0-9_-]+$/;

// GET /api/magic-items/[slug] - Get single magic item by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    // MUST await params (Next.js 15)
    const { slug } = await params;

    // Validate slug format
    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        {
          error: "Invalid slug format",
          message:
            "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
        },
        { status: 400 },
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Query magic item by slug
    const { data, error } = await supabase
      .from("official_magic_items")
      .select("*")
      .eq("slug", slug)
      .single();

    // Handle not found
    if (error || !data) {
      console.error("Database error fetching magic item:", error);
      return NextResponse.json(
        { error: "Magic item not found" },
        { status: 404 },
      );
    }

    // Return magic item
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error in GET /api/magic-items/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
