import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { UUIDSchema } from "@/lib/encounter-tables/schemas";
import { rollDice } from "@/lib/encounter-tables/utils/roll-dice";
import { ENTRY_SELECT } from "@/lib/encounter-tables/queries";

/**
 * POST /api/encounter-tables/[id]/roll
 * Roll on an encounter table and return the result
 * - Allows unauthenticated access for public tables
 * - Authenticated users can roll on their own private tables
 * - Uses cryptographically secure random number generation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    try {
      UUIDSchema.parse(id);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

    // Get current user (may be null for public access)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch the table to get die_size and check access permissions
    const { data: table, error: tableError } = await supabase
      .from("encounter_tables")
      .select("id, user_id, die_size, is_public")
      .eq("id", id)
      .single();

    if (tableError || !table) {
      return NextResponse.json(
        { error: "Encounter table not found" },
        { status: 404 },
      );
    }

    // Check access permissions:
    // - Public tables are accessible to anyone
    // - Private tables are only accessible to the owner
    if (!table.is_public) {
      if (!user || table.user_id !== user.id) {
        return NextResponse.json(
          {
            error: "Forbidden: This table is private",
            message: "Only the table owner can roll on private tables",
          },
          { status: 403 },
        );
      }
    }

    // Roll the dice
    let rollNumber: number;
    try {
      rollNumber = rollDice(table.die_size);
    } catch (error) {
      console.error("Dice rolling error:", error);
      return NextResponse.json(
        {
          error: "Failed to roll dice",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        { status: 500 },
      );
    }

    // Fetch the entry matching the roll number
    const { data: entry, error: entryError } = await supabase
      .from("encounter_table_entries")
      .select(ENTRY_SELECT)
      .eq("table_id", id)
      .eq("roll_number", rollNumber)
      .single();

    if (entryError || !entry) {
      // This should not happen if the table was properly generated
      // But handle it gracefully
      return NextResponse.json(
        {
          error: "No entry found for this roll",
          message: `Rolled ${rollNumber} but no matching entry exists in the table. The table may be incomplete.`,
          roll_number: rollNumber,
        },
        { status: 404 },
      );
    }

    // Return the roll result
    return NextResponse.json({
      roll_number: rollNumber,
      entry: {
        id: entry.id,
        table_id: entry.table_id,
        roll_number: entry.roll_number,
        monster_id: entry.monster_id,
        monster_snapshot: entry.monster_snapshot,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
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
