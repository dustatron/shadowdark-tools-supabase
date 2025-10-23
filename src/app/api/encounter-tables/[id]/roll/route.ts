/**
 * API Route: /api/encounter-tables/[id]/roll
 * Performs a dice roll on an encounter table
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUIDSchema } from "@/lib/encounter-tables/schemas";
import { rollDice } from "@/lib/encounter-tables/utils/roll-dice";
import { ENTRY_SELECT } from "@/lib/encounter-tables/queries";

/**
 * POST /api/encounter-tables/[id]/roll
 * Generates random number from 1 to die_size and returns corresponding entry
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

    // Fetch the table to get die_size and verify ownership
    const { data: table, error: fetchError } = await supabase
      .from("encounter_tables")
      .select("id, user_id, die_size")
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

    // Perform the dice roll
    const rollNumber = rollDice(table.die_size);

    // Fetch the entry corresponding to the roll number
    const { data: entry, error: entryError } = await supabase
      .from("encounter_table_entries")
      .select(ENTRY_SELECT)
      .eq("table_id", id)
      .eq("roll_number", rollNumber)
      .single();

    if (entryError) {
      console.error("Error fetching entry:", entryError);

      // Check if it's a not found error
      if (entryError.code === "PGRST116") {
        return NextResponse.json(
          {
            error:
              "No entry found for this roll. Table may not have entries generated.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch entry" },
        { status: 500 },
      );
    }

    if (!entry) {
      return NextResponse.json(
        {
          error:
            "No entry found for this roll. Table may not have entries generated.",
        },
        { status: 404 },
      );
    }

    // Return the roll result
    return NextResponse.json({
      roll_number: rollNumber,
      entry,
    });
  } catch (error) {
    console.error(
      "Unexpected error in POST /api/encounter-tables/[id]/roll:",
      error,
    );

    // Check if error is from rollDice utility
    if (error instanceof Error && error.message.includes("Die size")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
