/**
 * Monster filtering utility
 * Filters monsters from the database based on EncounterTableFilters criteria
 */

import { createClient } from "@/lib/supabase/server";
import { EncounterTableFilters } from "../types";
import { buildMonsterFilterQuery, countMatchingMonsters } from "../queries";

/**
 * Filter and fetch random monsters matching the given criteria
 *
 * @param filters - Filter criteria from EncounterTableFilters
 * @param limit - Number of monsters to return
 * @param excludeIds - Optional array of monster IDs to exclude (for uniqueness)
 * @returns Promise with array of monsters
 * @throws Error if insufficient monsters match criteria
 */
export async function filterMonsters(
  filters: EncounterTableFilters,
  limit: number,
  excludeIds?: string[],
) {
  const supabase = await createClient();

  // First, count how many monsters match the criteria
  const matchingCount = await countMatchingMonsters(
    supabase,
    filters,
    excludeIds,
  );

  if (matchingCount < limit) {
    throw new Error(
      `Only ${matchingCount} monsters match your criteria. Need at least ${limit}.`,
    );
  }

  // Build base query
  // Note: This assumes an 'all_monsters' view exists
  // The view should UNION official_monsters and user_monsters
  let query = supabase.from("all_monsters").select("*");

  // Apply filters
  query = buildMonsterFilterQuery(query, filters, excludeIds);

  // Fetch more than needed for client-side randomization
  // (Supabase doesn't support ORDER BY random() directly)
  const fetchLimit = Math.min(matchingCount, limit * 2);
  const { data, error } = await query.limit(fetchLimit);

  if (error) {
    console.error("Error filtering monsters:", error);
    throw new Error("Failed to fetch monsters from database");
  }

  if (!data || data.length === 0) {
    throw new Error("No monsters found matching your criteria");
  }

  // Shuffle results for randomness
  const shuffled = data.sort(() => Math.random() - 0.5);

  // Return exactly the requested limit
  return shuffled.slice(0, limit);
}
