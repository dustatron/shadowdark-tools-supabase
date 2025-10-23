/**
 * Database query helpers for Random Encounter Tables
 * Provides reusable query builders and select fragments
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { EncounterTableFilters } from "./types";

// ============================================
// Select Fragments (reusable field lists)
// ============================================

/**
 * All table fields for basic queries
 */
export const TABLE_SELECT = `
  id,
  user_id,
  name,
  description,
  die_size,
  is_public,
  public_slug,
  filters,
  created_at,
  updated_at
`;

/**
 * All entry fields for basic queries
 */
export const ENTRY_SELECT = `
  id,
  table_id,
  roll_number,
  monster_id,
  monster_snapshot,
  created_at,
  updated_at
`;

/**
 * Table with entries joined (for detail views)
 */
export const TABLE_WITH_ENTRIES_SELECT = `
  ${TABLE_SELECT},
  entries:encounter_table_entries(${ENTRY_SELECT})
`;

// ============================================
// Query Builders
// ============================================

/**
 * Build a query for selecting a table with all its entries
 * @param supabase - Supabase client instance
 * @param tableId - UUID of the table to fetch
 * @returns Configured Supabase query
 */
export function selectTableWithEntries(
  supabase: SupabaseClient,
  tableId: string,
) {
  return supabase
    .from("encounter_tables")
    .select(TABLE_WITH_ENTRIES_SELECT)
    .eq("id", tableId)
    .order("roll_number", {
      foreignTable: "encounter_table_entries",
      ascending: true,
    })
    .single();
}

/**
 * Apply monster filters to an all_monsters query
 * Note: Assumes an 'all_monsters' view exists that UNIONs official_monsters and user_monsters
 *
 * @param query - Base Supabase query on all_monsters view
 * @param filters - Filter criteria from EncounterTableFilters
 * @param excludeIds - Optional array of monster IDs to exclude (for uniqueness)
 * @returns Modified query with filters applied
 */
export function buildMonsterFilterQuery(
  query: any, // ReturnType<SupabaseClient['from']>
  filters: EncounterTableFilters,
  excludeIds?: string[],
) {
  // Level range filter
  if (filters.level_min !== undefined && filters.level_max !== undefined) {
    query = query
      .gte("challenge_level", filters.level_min)
      .lte("challenge_level", filters.level_max);
  }

  // Source filter - handle official, user, and public monsters
  // Note: The all_monsters view uses 'monster_type' field
  // with values 'official' for official_monsters and 'custom' for user_monsters
  // and an 'is_public' field for user monsters
  if (filters.sources && filters.sources.length > 0) {
    const hasOfficial = filters.sources.includes("official");
    const hasUser = filters.sources.includes("user");
    const hasPublic = filters.sources.includes("public");

    // Build source filter logic
    // If all three are selected, no filter needed
    if (!(hasOfficial && hasUser && hasPublic)) {
      if (hasOfficial && !hasUser && !hasPublic) {
        // Only official monsters
        query = query.eq("monster_type", "official");
      } else if (hasUser && !hasOfficial && !hasPublic) {
        // Only user's own monsters (not public)
        // Note: This will need user_id from context to work properly
        query = query.eq("monster_type", "custom").eq("is_public", false);
      } else if (hasPublic && !hasOfficial && !hasPublic) {
        // Only public user monsters
        query = query.eq("monster_type", "custom").eq("is_public", true);
      } else {
        // Mixed sources - use OR logic
        // This is more complex and may need custom SQL
        // For now, we'll allow all and filter in application if needed
        // TODO: Implement more sophisticated source filtering
      }
    }
  }

  // Alignment filter (optional)
  if (filters.alignments && filters.alignments.length > 0) {
    query = query.in("alignment", filters.alignments);
  }

  // Movement types filter (optional)
  // Assumes movement_types is a JSONB array field
  if (filters.movement_types && filters.movement_types.length > 0) {
    // PostgreSQL array overlap operator: &&
    // Check if any of the requested movement types exist in the monster's movement_types
    query = query.overlaps("movement_types", filters.movement_types);
  }

  // Search query filter (optional)
  // Search in name and description fields
  if (filters.search_query && filters.search_query.trim().length > 0) {
    const searchTerm = `%${filters.search_query.trim()}%`;
    query = query.or(
      `name.ilike.${searchTerm},description.ilike.${searchTerm}`,
    );
  }

  // Exclude specific monster IDs (for uniqueness)
  if (excludeIds && excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  return query;
}

/**
 * Helper to get a random subset of monsters matching filters
 * Uses Supabase's built-in randomization
 *
 * @param supabase - Supabase client instance
 * @param filters - Filter criteria
 * @param limit - Number of random monsters to fetch
 * @param excludeIds - Optional monster IDs to exclude
 * @returns Promise with query result
 */
export async function getRandomMonsters(
  supabase: SupabaseClient,
  filters: EncounterTableFilters,
  limit: number,
  excludeIds?: string[],
) {
  // Note: This assumes an 'all_monsters' view exists
  // If it doesn't, you'll need to query official_monsters and user_monsters separately
  let query = supabase.from("all_monsters").select("*");

  // Apply filters
  query = buildMonsterFilterQuery(query, filters, excludeIds);

  // Randomize and limit
  // Note: For true randomness with PostgreSQL, you'd use ORDER BY random()
  // Supabase doesn't expose this directly, so we may need a custom RPC function
  // For now, we'll fetch more than needed and randomize client-side
  const { data, error } = await query.limit(limit * 2); // Fetch extra for randomization

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Shuffle and take the requested limit
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * Count monsters matching filters (for validation)
 *
 * @param supabase - Supabase client instance
 * @param filters - Filter criteria
 * @param excludeIds - Optional monster IDs to exclude
 * @returns Promise with count
 */
export async function countMatchingMonsters(
  supabase: SupabaseClient,
  filters: EncounterTableFilters,
  excludeIds?: string[],
): Promise<number> {
  let query = supabase
    .from("all_monsters")
    .select("id", { count: "exact", head: true });

  query = buildMonsterFilterQuery(query, filters, excludeIds);

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}
