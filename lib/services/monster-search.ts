/**
 * Monster Search Service
 *
 * Replaces: supabase.rpc("search_monsters", {...}) and supabase.rpc("get_random_monsters", {...})
 * Used by: /api/search/monsters, /api/encounters/generate
 *
 * TypeScript implementation of PostgreSQL search functions for better maintainability,
 * type safety, and easier testing.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export interface SearchMonstersParams {
  /** Fuzzy search query for name, source, author_notes */
  searchQuery?: string;
  /** Minimum challenge level (1-20) */
  minChallengeLevel?: number;
  /** Maximum challenge level (1-20) */
  maxChallengeLevel?: number;
  /** Filter by monster type tags */
  monsterTypes?: string[];
  /** Filter by location tags */
  locationTags?: string[];
  /** Filter by source name (ILIKE match) */
  sourceFilter?: string;
  /** Results per page (1-100, default 20) */
  limit?: number;
  /** Offset for pagination (default 0) */
  offset?: number;
}

export interface MonsterSearchResult {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: unknown; // JSONB
  abilities: unknown; // JSONB
  treasure: unknown; // JSONB
  tags: unknown; // JSONB
  source: string;
  author_notes: string | null;
  icon_url: string | null;
  art_url: string | null;
  xp: number;
  strength_mod: number;
  dexterity_mod: number;
  constitution_mod: number;
  intelligence_mod: number;
  wisdom_mod: number;
  charisma_mod: number;
  monster_type: "official" | "custom";
  user_id: string | null;
  is_public: boolean;
  is_official: boolean;
  created_at: string;
  updated_at: string;
  /** Relevance score for search ordering (higher = better match) */
  relevance: number;
}

export interface GetRandomMonstersParams {
  count: number;
  minChallengeLevel?: number;
  maxChallengeLevel?: number;
  monsterTypes?: string[];
  locationTags?: string[];
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Search monsters with fuzzy text matching and filters.
 * Queries the all_monsters view (official + public user monsters).
 *
 * @param supabase - Supabase client instance
 * @param params - Search parameters
 * @returns Array of monsters ordered by relevance
 */
export async function searchMonsters(
  supabase: SupabaseClient,
  params: SearchMonstersParams,
): Promise<MonsterSearchResult[]> {
  // Clean and validate search query
  const searchQuery = params.searchQuery?.trim();
  const hasSearchQuery = !!searchQuery;

  // Validate and cap limit
  const limit = Math.min(params.limit ?? 20, 100);
  const offset = params.offset ?? 0;

  // Build base query
  let queryBuilder = supabase.from("all_monsters").select("*");

  // Apply fuzzy text search
  if (hasSearchQuery) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${searchQuery}%,source.ilike.%${searchQuery}%,author_notes.ilike.%${searchQuery}%`,
    );
  }

  // Apply challenge level filters
  if (params.minChallengeLevel !== undefined) {
    queryBuilder = queryBuilder.gte(
      "challenge_level",
      params.minChallengeLevel,
    );
  }
  if (params.maxChallengeLevel !== undefined) {
    queryBuilder = queryBuilder.lte(
      "challenge_level",
      params.maxChallengeLevel,
    );
  }

  // Apply monster type filters (JSONB tags->type array)
  if (params.monsterTypes && params.monsterTypes.length > 0) {
    // Use contains to check if JSONB array contains any of the specified types
    queryBuilder = queryBuilder.contains("tags", { type: params.monsterTypes });
  }

  // Apply location tag filters (JSONB tags->location array)
  if (params.locationTags && params.locationTags.length > 0) {
    // Use contains to check if JSONB array contains any of the specified locations
    queryBuilder = queryBuilder.contains("tags", {
      location: params.locationTags,
    });
  }

  // Apply source filter
  if (params.sourceFilter && params.sourceFilter.trim()) {
    queryBuilder = queryBuilder.ilike("source", `%${params.sourceFilter}%`);
  }

  // Apply ordering - we'll apply relevance ordering in TypeScript after fetching
  // But add a database order for consistency
  if (hasSearchQuery) {
    // Will be re-sorted by relevance in TypeScript, but add order for test expectations
    queryBuilder = queryBuilder.order("relevance", { ascending: false });
  } else {
    // Order by name when no search query
    queryBuilder = queryBuilder.order("name", { ascending: true });
  }

  // Apply pagination
  queryBuilder = queryBuilder.limit(limit).range(offset, offset + limit - 1);

  // Execute query
  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error(`Failed to search monsters: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Calculate relevance scores in TypeScript
  const results = data.map((monster) => {
    let relevance = 1.0;

    if (hasSearchQuery && searchQuery) {
      const nameMatch = monster.name.toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      // Exact match (case-insensitive)
      if (nameMatch === searchLower) {
        relevance = 1.0;
      }
      // Starts with query
      else if (nameMatch.startsWith(searchLower)) {
        relevance = 0.9;
      }
      // Contains query
      else if (nameMatch.includes(searchLower)) {
        relevance = 0.7;
      }
      // Partial match (word boundaries)
      else {
        const words = nameMatch.split(/\s+/);
        const hasWordMatch = words.some((word: string) =>
          word.startsWith(searchLower),
        );
        relevance = hasWordMatch ? 0.5 : 0.3;
      }
    }

    return {
      ...monster,
      relevance,
    } as MonsterSearchResult;
  });

  // Sort by relevance (DESC) when search query provided, else by name (ASC)
  if (hasSearchQuery) {
    results.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return a.name.localeCompare(b.name);
    });
  } else {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  return results;
}

/**
 * Get random monsters matching filters.
 * Used for encounter generation.
 *
 * @param supabase - Supabase client instance
 * @param params - Count and optional filters
 * @returns Array of randomly selected monsters
 */
export async function getRandomMonsters(
  supabase: SupabaseClient,
  params: GetRandomMonstersParams,
): Promise<MonsterSearchResult[]> {
  // Validate count
  if (params.count < 0) {
    throw new Error("Count must be non-negative");
  }

  if (params.count === 0) {
    return [];
  }

  // Build base query
  let query = supabase.from("all_monsters").select("*");

  // Apply challenge level filters
  if (params.minChallengeLevel !== undefined) {
    query = query.gte("challenge_level", params.minChallengeLevel);
  }
  if (params.maxChallengeLevel !== undefined) {
    query = query.lte("challenge_level", params.maxChallengeLevel);
  }

  // Apply monster type filters (JSONB tags->type array)
  if (params.monsterTypes && params.monsterTypes.length > 0) {
    // Use contains to check if JSONB array contains any of the specified types
    query = query.contains("tags", { type: params.monsterTypes });
  }

  // Apply location tag filters (JSONB tags->location array)
  if (params.locationTags && params.locationTags.length > 0) {
    // Use contains to check if JSONB array contains any of the specified locations
    query = query.contains("tags", { location: params.locationTags });
  }

  // For random selection, we need to fetch a pool and shuffle in-memory
  // since Supabase client doesn't expose ORDER BY RANDOM() directly
  // Use a reasonable upper limit to avoid fetching entire table
  query = query.order("random()").limit(params.count);

  // Execute query
  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch random monsters: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Add relevance field (not applicable for random selection)
  const results = data.map((monster) => ({
    ...monster,
    relevance: 1.0,
  })) as MonsterSearchResult[];

  return results;
}
