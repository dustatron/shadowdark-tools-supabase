/**
 * API Route: /api/encounter-tables/[id]/generate
 * Regenerates all entries for an encounter table
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUIDSchema } from "@/lib/encounter-tables/schemas";
import { regenerateTableEntries } from "@/lib/encounter-tables/utils/generate-table";
import { selectTableWithEntries } from "@/lib/encounter-tables/queries";

/**
 * POST /api/encounter-tables/[id]/generate
 * Regenerates all table entries with new random monsters matching the table's filters
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID
    const uuidResult = UUIDSchema.safeParse(id);
    if (!uuidResult.success) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

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

    // Fetch existing table to get filters and die_size
    const { data: table, error: fetchError } = await supabase
      .from("encounter_tables")
      .select("id, user_id, die_size, filters")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (table.user_id !== user.id) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    try {
      // Generate new entries
      const newEntries = await regenerateTableEntries(
        table.id,
        table.die_size,
        table.filters,
      );

      // Delete old entries
      const { error: deleteError } = await supabase
        .from("encounter_table_entries")
        .delete()
        .eq("table_id", id);

      if (deleteError) {
        console.error("Error deleting old entries:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete old entries" },
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
          { error: "Failed to generate new entries" },
          { status: 500 },
        );
      }

      // Update the table's updated_at timestamp
      const { error: updateError } = await supabase
        .from("encounter_tables")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating table timestamp:", updateError);
        // Non-critical error, continue
      }

      // Fetch and return the complete table with new entries
      const { data: completeTable, error: finalFetchError } =
        await selectTableWithEntries(supabase, id);

      if (finalFetchError || !completeTable) {
        console.error("Error fetching updated table:", finalFetchError);
        return NextResponse.json(
          { error: "Table regenerated but failed to fetch result" },
          { status: 500 },
        );
      }

      return NextResponse.json(completeTable);
    } catch (error) {
      console.error("Error generating table entries:", error);

      // Check if error is about insufficient monsters
      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: error.message.includes("monsters match")
              ? error.message
              : "Insufficient monsters match your criteria",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to regenerate table entries" },
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
