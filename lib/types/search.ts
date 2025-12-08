/**
 * Search result type discriminator
 */
export type ContentType = "monster" | "magic_item" | "equipment";

/**
 * Source type for content
 */
export type SourceType = "official" | "user";

/**
 * Unified search result returned by the API
 * Represents any searchable content type with type discriminator
 */
export interface SearchResult {
  /** UUID or slug identifier depending on content type */
  id: string;
  /** Display name of the item */
  name: string;
  /** Content type discriminator */
  type: ContentType;
  /** Whether this is official or user-generated content */
  source: SourceType;
  /** Full path to detail page (e.g., /monsters/uuid, /magic-items/slug) */
  detailUrl: string;
  /** Fuzzy match relevance score (0-1) */
  relevance: number;
  /** Brief description (optional, primarily for magic items) */
  description?: string | null;
}

/**
 * Search filter options for the API
 */
export interface SearchFiltersParams {
  /** Search query string (min 3 characters) */
  q: string;
  /** Filter by content source */
  source: "all" | "core" | "user";
  /** Include monsters in results */
  includeMonsters: boolean;
  /** Include magic items in results */
  includeMagicItems: boolean;
  /** Include equipment in results */
  includeEquipment: boolean;
  /** Maximum results to return (25, 50, or 100) */
  limit: number;
}

/**
 * Echo of applied filters in the response
 */
export interface AppliedFilters {
  source: "all" | "core" | "user";
  includeMonsters: boolean;
  includeMagicItems: boolean;
  includeEquipment: boolean;
  limit: number;
}

/**
 * Complete search response from the API
 */
export interface SearchResponse {
  /** Array of matched items sorted by relevance */
  results: SearchResult[];
  /** Total number of matching results */
  total: number;
  /** Echo of the search query */
  query: string;
  /** Echo of the applied filters */
  filters: AppliedFilters;
}

/**
 * Error response structure
 */
export interface SearchErrorResponse {
  /** Error message */
  error: string;
  /** Validation error details (for 400 errors) */
  details?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

/**
 * Database row returned by search_all_content() function
 */
export interface SearchAllContentRow {
  id: string;
  name: string;
  content_type: string;
  source: string;
  detail_url: string;
  relevance: number;
  description: string | null;
}
