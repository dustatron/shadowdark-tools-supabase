/**
 * Unified Search Service Contract
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
// Contract (Function Signatures)
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
  // Implementation will go here
  throw new Error("Not implemented");
}
