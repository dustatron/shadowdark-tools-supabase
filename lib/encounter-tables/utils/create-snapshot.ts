/**
 * Monster snapshot creation utility
 * Creates a complete snapshot of a monster's data for storage in encounter table entries
 */

import { createClient } from "@/lib/supabase/server";
import { MonsterSnapshot } from "../types";
import { logger } from "@/lib/utils/logger";

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
    logger.error("Monster not found:", monsterId, error);
    throw new Error(`Monster with ID ${monsterId} not found`);
  }

  // Helper function to calculate raw ability score from modifier
  // Formula: score = 10 + (modifier * 2)
  const calculateAbilityScore = (modifier: number = 0): number => {
    return 10 + modifier * 2;
  };

  // Map database fields to MonsterSnapshot format
  // Database has modifiers only (strength_mod, dexterity_mod, etc.)
  // Snapshot needs both raw scores and modifiers
  return {
    ...monster,
    // Raw ability scores (calculated from modifiers)
    str: calculateAbilityScore(monster.strength_mod),
    dex: calculateAbilityScore(monster.dexterity_mod),
    con: calculateAbilityScore(monster.constitution_mod),
    int: calculateAbilityScore(monster.intelligence_mod),
    wis: calculateAbilityScore(monster.wisdom_mod),
    cha: calculateAbilityScore(monster.charisma_mod),
    // Modifiers (map from database field names)
    str_mod: monster.strength_mod ?? 0,
    dex_mod: monster.dexterity_mod ?? 0,
    con_mod: monster.constitution_mod ?? 0,
    int_mod: monster.intelligence_mod ?? 0,
    wis_mod: monster.wisdom_mod ?? 0,
    cha_mod: monster.charisma_mod ?? 0,
  } as MonsterSnapshot;
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
    logger.error("Error fetching monsters:", error);
    throw new Error("Failed to create monster snapshots");
  }

  if (!monsters || monsters.length !== monsterIds.length) {
    throw new Error(
      `Expected ${monsterIds.length} monsters but found ${monsters?.length || 0}`,
    );
  }

  // Helper function to calculate raw ability score from modifier
  const calculateAbilityScore = (modifier: number = 0): number => {
    return 10 + modifier * 2;
  };

  // Map each monster to snapshot format
  return monsters.map((monster) => ({
    ...monster,
    // Raw ability scores (calculated from modifiers)
    str: calculateAbilityScore(monster.strength_mod),
    dex: calculateAbilityScore(monster.dexterity_mod),
    con: calculateAbilityScore(monster.constitution_mod),
    int: calculateAbilityScore(monster.intelligence_mod),
    wis: calculateAbilityScore(monster.wisdom_mod),
    cha: calculateAbilityScore(monster.charisma_mod),
    // Modifiers (map from database field names)
    str_mod: monster.strength_mod ?? 0,
    dex_mod: monster.dexterity_mod ?? 0,
    con_mod: monster.constitution_mod ?? 0,
    int_mod: monster.intelligence_mod ?? 0,
    wis_mod: monster.wisdom_mod ?? 0,
    cha_mod: monster.charisma_mod ?? 0,
  })) as MonsterSnapshot[];
}
