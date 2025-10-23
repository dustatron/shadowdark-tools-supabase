import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { PublicSlugSchema } from "@/lib/encounter-tables/schemas";
import { TABLE_WITH_ENTRIES_SELECT } from "@/lib/encounter-tables/queries";

/**
 * POST /api/encounter-tables/public/[slug]/copy
 * Copy a public encounter table to the authenticated user's collection
 * - Duplicates the table with all entries
 * - Sets new user_id to current user
 * - Copies all entries with their monster snapshots
 * - New table is private by default (no public_slug)
 * Requires authentication
 */
export async function POST(
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

    // Check authentication - copying requires a user account
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "You must be logged in to copy a table",
        },
        { status: 401 },
      );
    }

    // Fetch the public table with all entries
    const { data: sourceTable, error: fetchError } = await supabase
      .from("encounter_tables")
      .select(TABLE_WITH_ENTRIES_SELECT)
      .eq("public_slug", slug)
      .eq("is_public", true)
      .order("roll_number", {
        foreignTable: "encounter_table_entries",
        ascending: true,
      })
      .single();

    if (fetchError || !sourceTable) {
      return NextResponse.json(
        {
          error: "Public encounter table not found",
          message: "This table may be private or the link may be invalid",
        },
        { status: 404 },
      );
    }

    // Ensure entries exist
    if (!sourceTable.entries || sourceTable.entries.length === 0) {
      return NextResponse.json(
        {
          error: "Cannot copy table without entries",
          message: "This table has no entries to copy",
        },
        { status: 400 },
      );
    }

    // Check if user is copying their own table
    if (sourceTable.user_id === user.id) {
      return NextResponse.json(
        {
          error: "Cannot copy your own table",
          message: "This table already belongs to you",
        },
        { status: 400 },
      );
    }

    // Create a copy of the table for the current user
    const { data: newTable, error: tableError } = await supabase
      .from("encounter_tables")
      .insert({
        user_id: user.id,
        name: `${sourceTable.name} (Copy)`,
        description: sourceTable.description,
        die_size: sourceTable.die_size,
        is_public: false, // Default to private
        public_slug: null, // No public slug for copies
        filters: sourceTable.filters,
      })
      .select()
      .single();

    if (tableError || !newTable) {
      console.error("Error creating table copy:", tableError);
      return NextResponse.json(
        { error: "Failed to create table copy" },
        { status: 500 },
      );
    }

    // Copy all entries with their monster snapshots
    const entriesToInsert = sourceTable.entries.map((entry: any) => ({
      table_id: newTable.id, // New table ID
      roll_number: entry.roll_number,
      monster_id: entry.monster_id,
      monster_snapshot: entry.monster_snapshot,
    }));

    const { data: newEntries, error: entriesError } = await supabase
      .from("encounter_table_entries")
      .insert(entriesToInsert)
      .select();

    if (entriesError) {
      // If entries fail to insert, clean up the table
      console.error("Error copying entries:", entriesError);
      await supabase.from("encounter_tables").delete().eq("id", newTable.id);

      return NextResponse.json(
        { error: "Failed to copy table entries" },
        { status: 500 },
      );
    }

    // Fetch the complete new table with entries for response
    const { data: completeTable, error: completeError } = await supabase
      .from("encounter_tables")
      .select(TABLE_WITH_ENTRIES_SELECT)
      .eq("id", newTable.id)
      .order("roll_number", {
        foreignTable: "encounter_table_entries",
        ascending: true,
      })
      .single();

    if (completeError || !completeTable) {
      console.error("Error fetching complete table:", completeError);
      // Table was created successfully, just return basic info
      return NextResponse.json({
        message: "Table copied successfully",
        table: {
          id: newTable.id,
          name: newTable.name,
          entry_count: newEntries?.length || 0,
        },
      });
    }

    return NextResponse.json({
      message: "Table copied successfully",
      table: completeTable,
      meta: {
        original_table_id: sourceTable.id,
        original_slug: slug,
        entries_copied: newEntries?.length || 0,
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
