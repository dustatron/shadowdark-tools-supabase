/**
 * Table generation utility
 * Generates a complete set of encounter table entries with monster snapshots
 */

import { EncounterTableFilters, EncounterTableEntry } from "../types";
import { filterMonsters } from "./filter-monsters";
import { createMultipleSnapshots } from "./create-snapshot";

/**
 * Generate a complete set of entries for an encounter table
 * Filters monsters, creates snapshots, and builds entry objects
 *
 * @param tableId - UUID of the encounter table
 * @param dieSize - Number of entries to generate (1 to dieSize)
 * @param filters - Filter criteria for monster selection
 * @param excludeIds - Optional monster IDs to exclude
 * @returns Promise with array of entry objects ready for database insertion
 * @throws Error if insufficient monsters match criteria
 */
export async function generateTableEntries(
  tableId: string,
  dieSize: number,
  filters: EncounterTableFilters,
  excludeIds?: string[],
): Promise<Omit<EncounterTableEntry, "id" | "created_at" | "updated_at">[]> {
  // Validate die size
  if (dieSize < 2 || dieSize > 1000) {
    throw new Error("Die size must be between 2 and 1000");
  }

  // Fetch random monsters matching the filters
  const monsters = await filterMonsters(filters, dieSize, excludeIds);

  // Verify we got enough unique monsters
  if (monsters.length < dieSize) {
    throw new Error(
      `Only ${monsters.length} unique monsters available. Need ${dieSize}.`,
    );
  }

  // Verify all monsters are unique
  const monsterIds = monsters.map((m) => m.id);
  const uniqueIds = new Set(monsterIds);
  if (uniqueIds.size !== monsterIds.length) {
    throw new Error("Duplicate monsters detected in generated table");
  }

  // Create snapshots for all monsters
  const snapshots = await createMultipleSnapshots(monsterIds);

  // Build entry objects with roll numbers
  const entries = snapshots.map((snapshot, index) => ({
    table_id: tableId,
    roll_number: index + 1, // Roll numbers are 1-indexed
    monster_id: snapshot.id,
    monster_snapshot: snapshot,
  }));

  return entries;
}

/**
 * Regenerate all entries for an existing table
 * Deletes old entries and creates new ones with the same filters
 *
 * @param tableId - UUID of the table to regenerate
 * @param dieSize - Number of entries
 * @param filters - Filter criteria
 * @returns Promise with new entries
 */
export async function regenerateTableEntries(
  tableId: string,
  dieSize: number,
  filters: EncounterTableFilters,
): Promise<Omit<EncounterTableEntry, "id" | "created_at" | "updated_at">[]> {
  // Generate completely new entries (no exclusions)
  return await generateTableEntries(tableId, dieSize, filters);
}

/**
 * Replace a single entry in a table
 * Finds a new monster that's not already in the table
 *
 * @param tableId - UUID of the table
 * @param rollNumber - Roll number to replace
 * @param filters - Filter criteria
 * @param currentMonsterIds - IDs of monsters currently in the table
 * @param specificMonsterId - Optional specific monster to use (bypasses filters)
 * @returns Promise with new entry object
 */
export async function replaceSingleEntry(
  tableId: string,
  rollNumber: number,
  filters: EncounterTableFilters,
  currentMonsterIds: string[],
  specificMonsterId?: string,
): Promise<Omit<EncounterTableEntry, "id" | "created_at" | "updated_at">> {
  let newMonster;

  if (specificMonsterId) {
    // User specified a specific monster (search mode)
    // Verify it's not already in the table
    if (currentMonsterIds.includes(specificMonsterId)) {
      throw new Error("This monster is already in the table");
    }

    // Create snapshot for the specific monster
    const { createMonsterSnapshot } = await import("./create-snapshot");
    const snapshot = await createMonsterSnapshot(specificMonsterId);
    newMonster = snapshot;
  } else {
    // Random mode: Find a monster not already in the table
    const monsters = await filterMonsters(filters, 1, currentMonsterIds);

    if (monsters.length === 0) {
      throw new Error("No available monsters match your criteria");
    }

    newMonster = monsters[0];
  }

  // Build new entry
  return {
    table_id: tableId,
    roll_number: rollNumber,
    monster_id: newMonster.id,
    monster_snapshot: newMonster,
  };
}
