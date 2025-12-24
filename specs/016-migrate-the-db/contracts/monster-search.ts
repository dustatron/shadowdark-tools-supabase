/**
 * Monster Search Service Contract
 *
 * Replaces: supabase.rpc("search_monsters", {...})
 * Used by: /api/search/monsters, /api/encounters/generate
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
// Contract (Function Signatures)
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
  // Implementation will go here
  throw new Error("Not implemented");
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
  // Implementation will go here
  throw new Error("Not implemented");
}
