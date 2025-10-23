/**
 * API Route: /api/encounter-tables/[id]/generate
 * Handles regeneration of all table entries with new random monsters
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateTableEntries } from "@/lib/encounter-tables/utils/generate-table";
import { TABLE_SELECT } from "@/lib/encounter-tables/queries";

/**
 * POST /api/encounter-tables/[id]/generate
 * Regenerate all entries for an encounter table
 * Replaces all existing entries with new random monsters matching the table's filters
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Fetch the table with ownership check
    const { data: table, error: fetchError } = await supabase
      .from("encounter_tables")
      .select(TABLE_SELECT)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !table) {
      return NextResponse.json(
        { error: "Table not found or access denied" },
        { status: 404 },
      );
    }

    // Generate new entries using the table's filters
    try {
      const newEntries = await regenerateTableEntries(
        table.id,
        table.die_size,
        table.filters,
      );

      // Delete old entries and insert new ones
      // Note: Supabase doesn't have a direct transaction API, but we can use sequential operations
      // RLS policies ensure we can only delete entries from tables we own
      const { error: deleteError } = await supabase
        .from("encounter_table_entries")
        .delete()
        .eq("table_id", table.id);

      if (deleteError) {
        console.error("Error deleting old entries:", deleteError);
        return NextResponse.json(
          { error: "Failed to clear existing table entries" },
          { status: 500 },
        );
      }

      // Insert new entries
      const { error: insertError } = await supabase
        .from("encounter_table_entries")
        .insert(newEntries);

      if (insertError) {
        console.error("Error inserting new entries:", insertError);
        return NextResponse.json(
          { error: "Failed to generate new table entries" },
          { status: 500 },
        );
      }

      // Fetch the complete table with new entries
      const { data: updatedTable, error: refetchError } = await supabase
        .from("encounter_tables")
        .select(
          `
          ${TABLE_SELECT},
          entries:encounter_table_entries(
            id,
            table_id,
            roll_number,
            monster_id,
            monster_snapshot,
            created_at,
            updated_at
          )
        `,
        )
        .eq("id", table.id)
        .order("roll_number", {
          foreignTable: "encounter_table_entries",
          ascending: true,
        })
        .single();

      if (refetchError) {
        console.error("Error fetching updated table:", refetchError);
        // Still return success since entries were created, just without full data
        return NextResponse.json(
          {
            message: "Table regenerated successfully",
            table_id: table.id,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(updatedTable, { status: 200 });
    } catch (error) {
      console.error("Error generating table entries:", error);

      // Check if error is about insufficient monsters
      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: error.message.includes("monsters")
              ? error.message
              : "Insufficient monsters match your criteria",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to regenerate encounter table" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      "Unexpected error in POST /api/encounter-tables/[id]/generate:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
