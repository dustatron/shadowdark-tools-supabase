/**
 * Monster filtering utility
 * Filters monsters from the database based on EncounterTableFilters criteria
 */

import { createClient } from "@/lib/supabase/server";
import { EncounterTableFilters } from "../types";
import { buildMonsterFilterQuery, countMatchingMonsters } from "../queries";
import { logger } from "@/lib/utils/logger";

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

  // Get current user for favorites filtering
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If favorites is selected but user is not authenticated, throw error
  if (filters.sources.includes("favorites") && !user) {
    throw new Error("You must be logged in to use favorites filter");
  }

  // Handle favorites filtering separately
  const hasFavorites = filters.sources.includes("favorites");
  if (hasFavorites) {
    // Query monsters that are in favorites
    const { data: favoriteIds, error: favError } = await supabase
      .from("favorites")
      .select("item_id")
      .eq("user_id", user!.id)
      .eq("item_type", "monster");

    if (favError) {
      logger.error("Error fetching favorites:", favError);
      throw new Error("Failed to fetch favorites");
    }

    if (!favoriteIds || favoriteIds.length === 0) {
      throw new Error("You have no favorite monsters");
    }

    const favoriteMonsterIds = favoriteIds.map((f) => f.item_id);

    // Query monsters from all_monsters that match favorite IDs
    let query = supabase.from("all_monsters").select("*");

    // Filter to only favorite monster IDs
    query = query.in("id", favoriteMonsterIds);

    // Apply other filters (level, movement, search)
    if (filters.level_min !== undefined && filters.level_max !== undefined) {
      query = query
        .gte("challenge_level", filters.level_min)
        .lte("challenge_level", filters.level_max);
    }

    if (filters.movement_types && filters.movement_types.length > 0) {
      const movementConditions = filters.movement_types.map(
        (type) => `speed.ilike.%${type}%`,
      );
      query = query.or(movementConditions.join(","));
    }

    if (filters.search_query && filters.search_query.trim().length > 0) {
      const searchTerm = `%${filters.search_query.trim()}%`;
      query = query.or(
        `name.ilike.${searchTerm},author_notes.ilike.${searchTerm}`,
      );
    }

    if (excludeIds && excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error filtering favorite monsters:", error);
      throw new Error("Failed to fetch monsters from database");
    }

    if (!data || data.length === 0) {
      throw new Error("No favorite monsters match your criteria");
    }

    if (data.length < limit) {
      throw new Error(
        `Only ${data.length} favorite monsters match your criteria. Need at least ${limit}.`,
      );
    }

    // Shuffle and return
    const shuffled = data.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  // Original logic for non-favorites filtering
  // First, count how many monsters match the criteria
  const matchingCount = await countMatchingMonsters(
    supabase,
    filters,
    excludeIds,
    user?.id,
  );

  logger.debug(
    `[filterMonsters] Found ${matchingCount} matching monsters for filters:`,
    JSON.stringify(filters),
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

  // Apply filters (pass user for user_id filtering)
  query = buildMonsterFilterQuery(query, filters, excludeIds, user?.id);

  // Fetch more than needed for client-side randomization
  // (Supabase doesn't support ORDER BY random() directly)
  const fetchLimit = Math.min(matchingCount, limit * 2);
  const { data, error } = await query.limit(fetchLimit);

  if (error) {
    logger.error("Error filtering monsters:", error);
    throw new Error("Failed to fetch monsters from database");
  }

  logger.debug(`[filterMonsters] Fetched ${data?.length || 0} monsters`);

  if (!data || data.length === 0) {
    throw new Error("No monsters found matching your criteria");
  }

  // Shuffle results for randomness
  const shuffled = data.sort(() => Math.random() - 0.5);

  // Return exactly the requested limit
  return shuffled.slice(0, limit);
}
