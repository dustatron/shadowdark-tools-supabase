/**
 * Monster snapshot creation utility
 * Creates a complete snapshot of a monster's data for storage in encounter table entries
 */

import { createClient } from "@/lib/supabase/server";
import { MonsterSnapshot } from "../types";

/**
 * Create a complete snapshot of a monster by its ID
 * Fetches all monster data from the all_monsters view
 *
 * @param monsterId - UUID of the monster to snapshot
 * @returns Promise with MonsterSnapshot object
 * @throws Error if monster not found
 */
export async function createMonsterSnapshot(
  monsterId: string,
): Promise<MonsterSnapshot> {
  const supabase = await createClient();

  // Fetch complete monster data from all_monsters view
  // This view should include both official and user monsters
  const { data: monster, error } = await supabase
    .from("all_monsters")
    .select("*")
    .eq("id", monsterId)
    .single();

  if (error || !monster) {
    console.error("Monster not found:", monsterId, error);
    throw new Error(`Monster with ID ${monsterId} not found`);
  }

  // Return the monster data as a snapshot
  // The snapshot preserves all fields at the time of creation
  return monster as MonsterSnapshot;
}

/**
 * Create snapshots for multiple monsters
 * Useful when generating a full table
 *
 * @param monsterIds - Array of monster UUIDs
 * @returns Promise with array of MonsterSnapshot objects
 * @throws Error if any monster is not found
 */
export async function createMultipleSnapshots(
  monsterIds: string[],
): Promise<MonsterSnapshot[]> {
  const supabase = await createClient();

  const { data: monsters, error } = await supabase
    .from("all_monsters")
    .select("*")
    .in("id", monsterIds);

  if (error) {
    console.error("Error fetching monsters:", error);
    throw new Error("Failed to create monster snapshots");
  }

  if (!monsters || monsters.length !== monsterIds.length) {
    throw new Error(
      `Expected ${monsterIds.length} monsters but found ${monsters?.length || 0}`,
    );
  }

  return monsters as MonsterSnapshot[];
}
