import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ReplaceEntrySchema, UUIDSchema } from "@/lib/encounter-tables/schemas";
import { createMonsterSnapshot } from "@/lib/encounter-tables/utils/create-snapshot";
import { filterMonsters } from "@/lib/encounter-tables/utils/filter-monsters";
import { EncounterTableFilters } from "@/lib/encounter-tables/types";

/**
 * PATCH /api/encounter-tables/[id]/entries/[roll]
 * Replace a single entry in an encounter table
 * - mode: "random" - replace with random monster matching table filters
 * - mode: "search" - replace with specific monster by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roll: string }> },
) {
  try {
    const supabase = await createClient();
    const { id, roll } = await params;

    // Validate UUID format for table ID
    try {
      UUIDSchema.parse(id);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

    // Validate roll number
    const rollNumber = parseInt(roll, 10);
    if (isNaN(rollNumber) || rollNumber < 1) {
      return NextResponse.json(
        { error: "Invalid roll number. Must be a positive integer." },
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

    // Parse and validate request body
    const body = await request.json();
    const { mode, monster_id } = ReplaceEntrySchema.parse(body);

    // Fetch the table and verify ownership
    const { data: table, error: tableError } = await supabase
      .from("encounter_tables")
      .select("id, user_id, die_size, filters")
      .eq("id", id)
      .single();

    if (tableError || !table) {
      return NextResponse.json(
        { error: "Encounter table not found" },
        { status: 404 },
      );
    }

    if (table.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only modify your own tables" },
        { status: 403 },
      );
    }

    // Validate roll number is within die size
    if (rollNumber > table.die_size) {
      return NextResponse.json(
        {
          error: `Roll number ${rollNumber} exceeds table die size of ${table.die_size}`,
        },
        { status: 400 },
      );
    }

    // Check if entry exists
    const { data: existingEntry, error: entryError } = await supabase
      .from("encounter_table_entries")
      .select("id")
      .eq("table_id", id)
      .eq("roll_number", rollNumber)
      .single();

    if (entryError || !existingEntry) {
      return NextResponse.json(
        { error: `Entry with roll number ${rollNumber} not found` },
        { status: 404 },
      );
    }

    let newMonsterId: string;

    // Handle different replacement modes
    if (mode === "search") {
      // Use specific monster ID provided
      if (!monster_id) {
        return NextResponse.json(
          { error: "monster_id is required when mode is 'search'" },
          { status: 400 },
        );
      }

      // Validate monster ID format
      try {
        UUIDSchema.parse(monster_id);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid monster ID format" },
          { status: 400 },
        );
      }

      newMonsterId = monster_id;
    } else {
      // mode === "random"
      // Get all existing monster IDs from this table for uniqueness check
      const { data: existingEntries, error: existingError } = await supabase
        .from("encounter_table_entries")
        .select("monster_id")
        .eq("table_id", id)
        .neq("roll_number", rollNumber); // Exclude current entry

      if (existingError) {
        console.error("Error fetching existing entries:", existingError);
        return NextResponse.json(
          { error: "Failed to fetch existing entries" },
          { status: 500 },
        );
      }

      // Extract existing monster IDs (filter out nulls)
      const excludeIds = existingEntries
        .map((entry) => entry.monster_id)
        .filter((id): id is string => id !== null);

      // Get a random monster matching table filters
      try {
        const filters = table.filters as EncounterTableFilters;
        const monsters = await filterMonsters(filters, 1, excludeIds);

        if (monsters.length === 0) {
          return NextResponse.json(
            { error: "No monsters found matching table filters" },
            { status: 404 },
          );
        }

        newMonsterId = monsters[0].id;
      } catch (error) {
        console.error("Error filtering monsters:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to find random monster";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    // Create snapshot of the new monster
    let monsterSnapshot;
    try {
      monsterSnapshot = await createMonsterSnapshot(newMonsterId);
    } catch (error) {
      console.error("Error creating monster snapshot:", error);
      return NextResponse.json(
        { error: "Monster not found or inaccessible" },
        { status: 404 },
      );
    }

    // Check for duplicate monster in table (constraint will catch this, but better UX to check)
    const { data: duplicateCheck } = await supabase
      .from("encounter_table_entries")
      .select("id")
      .eq("table_id", id)
      .eq("monster_id", newMonsterId)
      .neq("roll_number", rollNumber);

    if (duplicateCheck && duplicateCheck.length > 0) {
      return NextResponse.json(
        {
          error:
            "This monster is already in the table at a different roll number",
        },
        { status: 400 },
      );
    }

    // Update the entry
    const { data: updatedEntry, error: updateError } = await supabase
      .from("encounter_table_entries")
      .update({
        monster_id: newMonsterId,
        monster_snapshot: monsterSnapshot,
      })
      .eq("id", existingEntry.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Database error updating entry:", updateError);
      return NextResponse.json(
        { error: "Failed to update entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Entry replaced successfully",
      entry: updatedEntry,
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
