/**
 * Unified Search Service
 *
 * Replaces: supabase.rpc("search_all_content", {...})
 * Used by: /api/search
 */

import { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export type ContentType = "monster" | "magic_item" | "equipment" | "spell";
export type SourceType = "official" | "user";
export type SourceFilter = "all" | "core" | "user";

export interface UnifiedSearchParams {
  /** Search query (required) */
  searchQuery: string;
  /** Filter by source: 'all', 'core' (official), 'user' */
  sourceFilter?: SourceFilter;
  /** Include monsters in results */
  includeMonsters?: boolean;
  /** Include magic items in results */
  includeMagicItems?: boolean;
  /** Include equipment in results */
  includeEquipment?: boolean;
  /** Include spells in results */
  includeSpells?: boolean;
  /** Max results to return (default 25) */
  limit?: number;
}

export interface UnifiedSearchResult {
  /** Item ID (UUID or slug depending on type) */
  id: string;
  /** Display name */
  name: string;
  /** Type of content */
  contentType: ContentType;
  /** Source: official or user-created */
  source: SourceType;
  /** URL path to detail page */
  detailUrl: string;
  /** Relevance score (0-1) */
  relevance: number;
  /** Optional description excerpt */
  description: string | null;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Search across all content types with fuzzy matching.
 * Queries monsters, magic items, equipment, and spells in parallel.
 *
 * @param supabase - Supabase client instance
 * @param params - Search parameters
 * @returns Array of results ordered by relevance
 */
export async function searchAllContent(
  supabase: SupabaseClient,
  params: UnifiedSearchParams,
): Promise<UnifiedSearchResult[]> {
  const {
    searchQuery,
    sourceFilter = "all",
    includeMonsters = false,
    includeMagicItems = false,
    includeEquipment = false,
    includeSpells = false,
    limit = 25,
  } = params;

  // Early return if no content types enabled
  if (
    !includeMonsters &&
    !includeMagicItems &&
    !includeEquipment &&
    !includeSpells
  ) {
    return [];
  }

  // Build parallel queries based on enabled content types
  const queries: Promise<UnifiedSearchResult[]>[] = [];

  if (includeMonsters) {
    queries.push(searchMonsters(supabase, searchQuery, sourceFilter, limit));
  }

  if (includeMagicItems) {
    queries.push(searchMagicItems(supabase, searchQuery, sourceFilter, limit));
  }

  if (includeEquipment) {
    queries.push(searchEquipment(supabase, searchQuery, limit));
  }

  if (includeSpells) {
    queries.push(searchSpells(supabase, searchQuery, sourceFilter, limit));
  }

  // Execute all queries in parallel
  const results = await Promise.all(queries);

  // Flatten results
  const allResults = results.flat();

  // Sort by relevance DESC
  allResults.sort((a, b) => b.relevance - a.relevance);

  // Apply overall limit
  return allResults.slice(0, limit);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Search monsters from official_monsters and user_monsters tables
 */
async function searchMonsters(
  supabase: SupabaseClient,
  query: string,
  sourceFilter: SourceFilter,
  limit: number,
): Promise<UnifiedSearchResult[]> {
  const allMonsters: UnifiedSearchResult[] = [];

  // Query official monsters
  if (sourceFilter === "all" || sourceFilter === "core") {
    const { data: officialMonsters } = await supabase
      .from("official_monsters")
      .select("id, name, description")
      .ilike("name", `%${query}%`)
      .eq("is_public", true)
      .order("name", { ascending: true })
      .limit(limit);

    if (officialMonsters) {
      allMonsters.push(
        ...officialMonsters.map((m: any) => ({
          id: m.id,
          name: m.name,
          contentType: "monster" as const,
          source: "official" as const,
          detailUrl: `/monsters/${m.id}`,
          relevance: calculateRelevance(m.name, query),
          description: m.description || null,
        })),
      );
    }
  }

  // Query user monsters
  if (sourceFilter === "all" || sourceFilter === "user") {
    const { data: userMonsters } = await supabase
      .from("user_monsters")
      .select("id, name, description")
      .ilike("name", `%${query}%`)
      .eq("is_public", true)
      .order("name", { ascending: true })
      .limit(limit);

    if (userMonsters) {
      allMonsters.push(
        ...userMonsters.map((m: any) => ({
          id: m.id,
          name: m.name,
          contentType: "monster" as const,
          source: "user" as const,
          detailUrl: `/monsters/${m.id}`,
          relevance: calculateRelevance(m.name, query),
          description: m.description || null,
        })),
      );
    }
  }

  return allMonsters;
}

/**
 * Search magic items from official_magic_items and user_magic_items tables
 */
async function searchMagicItems(
  supabase: SupabaseClient,
  query: string,
  sourceFilter: SourceFilter,
  limit: number,
): Promise<UnifiedSearchResult[]> {
  const allItems: UnifiedSearchResult[] = [];

  // Query official magic items
  if (sourceFilter === "all" || sourceFilter === "core") {
    const { data: officialItems } = await supabase
      .from("official_magic_items")
      .select("id, name, slug, description")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    if (officialItems) {
      allItems.push(
        ...officialItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          contentType: "magic_item" as const,
          source: "official" as const,
          detailUrl: `/magic-items/${item.slug}`,
          relevance: calculateRelevance(item.name, query),
          description: item.description || null,
        })),
      );
    }
  }

  // Query user magic items
  if (sourceFilter === "all" || sourceFilter === "user") {
    const { data: userItems } = await supabase
      .from("user_magic_items")
      .select("id, name, slug, description")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    if (userItems) {
      allItems.push(
        ...userItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          contentType: "magic_item" as const,
          source: "user" as const,
          detailUrl: `/magic-items/${item.slug}`,
          relevance: calculateRelevance(item.name, query),
          description: item.description || null,
        })),
      );
    }
  }

  return allItems;
}

/**
 * Search equipment from equipment table (official only)
 */
async function searchEquipment(
  supabase: SupabaseClient,
  query: string,
  limit: number,
): Promise<UnifiedSearchResult[]> {
  const { data: equipmentList } = await supabase
    .from("equipment")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(limit);

  if (!equipmentList) {
    return [];
  }

  return equipmentList.map((item: any) => ({
    id: item.id,
    name: item.name,
    contentType: "equipment" as const,
    source: "official" as const,
    detailUrl: `/equipment/${item.id}`,
    relevance: calculateRelevance(item.name, query),
    description: null,
  }));
}

/**
 * Search spells from official_spells and user_spells tables
 */
async function searchSpells(
  supabase: SupabaseClient,
  query: string,
  sourceFilter: SourceFilter,
  limit: number,
): Promise<UnifiedSearchResult[]> {
  const allSpells: UnifiedSearchResult[] = [];

  // Query official spells
  if (sourceFilter === "all" || sourceFilter === "core") {
    const { data: officialSpells } = await supabase
      .from("official_spells")
      .select("id, name, slug, description")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    if (officialSpells) {
      allSpells.push(
        ...officialSpells.map((spell: any) => ({
          id: spell.id,
          name: spell.name,
          contentType: "spell" as const,
          source: "official" as const,
          detailUrl: `/spells/${spell.slug}`,
          relevance: calculateRelevance(spell.name, query),
          description: spell.description || null,
        })),
      );
    }
  }

  // Query user spells
  if (sourceFilter === "all" || sourceFilter === "user") {
    const { data: userSpells } = await supabase
      .from("user_spells")
      .select("id, name, slug, description")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    if (userSpells) {
      allSpells.push(
        ...userSpells.map((spell: any) => ({
          id: spell.id,
          name: spell.name,
          contentType: "spell" as const,
          source: "user" as const,
          detailUrl: `/spells/${spell.slug}`,
          relevance: calculateRelevance(spell.name, query),
          description: spell.description || null,
        })),
      );
    }
  }

  return allSpells;
}

/**
 * Calculate relevance score based on how well the name matches the query.
 * Returns a score between 0 and 1.
 *
 * Logic:
 * - Exact match (case-insensitive): 1.0
 * - Starts with query: 0.8
 * - Contains query: 0.5
 * - Otherwise: 0.3 (fallback for partial matches)
 */
function calculateRelevance(name: string, query: string): number {
  const nameLower = name.toLowerCase();
  const queryLower = query.toLowerCase();

  if (nameLower === queryLower) {
    return 1.0;
  }

  if (nameLower.startsWith(queryLower)) {
    return 0.8;
  }

  if (nameLower.includes(queryLower)) {
    return 0.5;
  }

  return 0.3;
}
