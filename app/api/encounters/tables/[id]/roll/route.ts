import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/encounters/tables/[id]/roll - Roll on encounter table
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if table exists
    const { data: table, error: tableError } = await supabase
      .from("encounter_tables")
      .select("id, name")
      .eq("id", id)
      .single();

    if (tableError || !table) {
      return NextResponse.json(
        { error: "Encounter table not found" },
        { status: 404 },
      );
    }

    // Get all entries for this table
    const { data: entries, error: entriesError } = await supabase
      .from("encounter_table_entries")
      .select("*")
      .eq("table_id", id)
      .order("roll_min");

    if (entriesError || !entries || entries.length === 0) {
      return NextResponse.json(
        { error: "No entries found for this encounter table" },
        { status: 404 },
      );
    }

    // Determine roll range
    const minRoll = Math.min(...entries.map((e) => e.roll_min));
    const maxRoll = Math.max(...entries.map((e) => e.roll_max));

    // Roll the dice
    const roll = Math.floor(Math.random() * (maxRoll - minRoll + 1)) + minRoll;

    // Find the matching entry
    const matchingEntry = entries.find(
      (entry) => roll >= entry.roll_min && roll <= entry.roll_max,
    );

    if (!matchingEntry) {
      return NextResponse.json(
        { error: "No matching entry found for roll result" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      result: {
        roll,
        rollRange: { min: minRoll, max: maxRoll },
        encounter_description: matchingEntry.encounter_description,
        entry: matchingEntry,
      },
      table: {
        id: table.id,
        name: table.name,
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
