import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { PublicSlugSchema } from "@/lib/encounter-tables/schemas";
import { TABLE_WITH_ENTRIES_SELECT } from "@/lib/encounter-tables/queries";

/**
 * GET /api/encounter-tables/public/[slug]
 * Fetch a public encounter table by its slug
 * Does NOT require authentication - public access
 * Returns table with all entries and author info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // Validate slug format
    try {
      PublicSlugSchema.parse(slug);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid public slug format. Must be exactly 8 characters." },
        { status: 400 },
      );
    }

    // Fetch the public table with entries and author info
    // Note: RLS policies allow anyone to read public tables
    const { data: table, error } = await supabase
      .from("encounter_tables")
      .select(
        `
        ${TABLE_WITH_ENTRIES_SELECT},
        author:user_profiles!encounter_tables_user_id_fkey (
          id,
          display_name,
          avatar_url,
          username_slug
        )
      `,
      )
      .eq("public_slug", slug)
      .eq("is_public", true)
      .order("roll_number", {
        foreignTable: "encounter_table_entries",
        ascending: true,
      })
      .single();

    if (error || !table) {
      // Table not found or not public
      return NextResponse.json(
        {
          error: "Public encounter table not found",
          message: "This table may be private or the link may be invalid",
        },
        { status: 404 },
      );
    }

    // Ensure entries exist
    if (!table.entries || table.entries.length === 0) {
      return NextResponse.json(
        {
          error: "Table has no entries",
          message: "This table exists but has no generated entries",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      table,
      meta: {
        is_public: true,
        entry_count: table.entries.length,
        author: table.author,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
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
