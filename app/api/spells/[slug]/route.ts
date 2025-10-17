import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// GET /api/spells/[slug] - Get specific spell
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: spell, error } = await supabase
      .from("all_spells")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !spell) {
      console.error("Database error fetching spell:", error);
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    return NextResponse.json(spell);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
