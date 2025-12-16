import type { DatabaseMonster, AllMonstersView } from "./database";

// Re-export database types for convenience
export type { DatabaseMonster, AllMonstersView };

// Monster entity type alias for database type
export type Monster = DatabaseMonster;

export interface AllMonster extends AllMonstersView {
  creator_id?: string;
}

// Monster author/creator information
export interface MonsterAuthor {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username_slug: string | null;
}

// Monster with extended details (for detail pages)
export interface MonsterWithAuthor extends Monster {
  author?: MonsterAuthor | null;
  xp?: number;
  description?: string;
  tactics?: string;
  wants?: string;
  gm_notes?: string;
  monster_type?: "official" | "user" | "custom";
  creator_id?: string;
  username_slug?: string | null;
}

export const AVAILABLE_SPEED_TYPES = [
  "close",
  "close (climb)",
  "close (swim)",
  "double near",
  "double near (burrow)",
  "double near (burrow, swim)",
  "double near (climb)",
  "double near (fly)",
  "double near (fly, swim)",
  "double near (swim)",
  "far (teleport)",
  "near",
  "near (burrow)",
  "near (burrow, climb)",
  "near (climb)",
  "near (climb, fly)",
  "near (climb, swim)",
  "near (fly)",
  "near (swim)",
  "near (swim, fly)",
  "none",
  "triple near (burrow, swim)",
] as const;

export type SpeedType = (typeof AVAILABLE_SPEED_TYPES)[number];

export const AVAILABLE_ALIGNMENTS = [
  { value: "L", label: "Lawful" },
  { value: "N", label: "Neutral" },
  { value: "C", label: "Chaotic" },
] as const;

// UI types
export type ViewMode = "cards" | "table";

// Filter types
export interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  speedType: string[];
  alignment: string[];
  monsterSource: "all" | "official" | "custom";
  view: ViewMode;
}

// Pagination types
export interface PaginationState {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_FILTERS: FilterValues = {
  search: "",
  challengeLevelRange: [1, 50],
  types: [],
  speedType: [],
  alignment: [],
  monsterSource: "all",
  view: "cards",
};

export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 20,
};

/**
 * Parse URL search parameters into filter values
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): FilterValues {
  // Handle both URLSearchParams and plain object
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] || null : value || null;
  };

  const search = get("q") || get("search") || "";

  const minCl = parseInt(get("min_cl") || "1");
  const maxCl = parseInt(get("max_cl") || "50");
  const challengeLevelRange: [number, number] = [
    isNaN(minCl) ? 1 : Math.max(1, Math.min(100, minCl)),
    isNaN(maxCl) ? 50 : Math.max(1, Math.min(100, maxCl)),
  ];

  const typesParam = get("types");
  const types = typesParam ? typesParam.split(",").filter(Boolean) : [];

  const speedParam = get("speed");
  const speedType = speedParam ? speedParam.split(",").filter(Boolean) : [];

  const alignmentParam = get("alignment");
  const alignment = alignmentParam
    ? alignmentParam.split(",").filter(Boolean)
    : [];

  const sourceParam = get("type") || get("source") || "all";
  const monsterSource =
    sourceParam === "official" || sourceParam === "custom"
      ? sourceParam
      : "all";

  const viewParam = get("view");
  const view: ViewMode = viewParam === "table" ? "table" : "cards";

  return {
    search,
    challengeLevelRange,
    types,
    speedType,
    alignment,
    monsterSource,
    view,
  };
}

/**
 * Parse pagination from URL search parameters
 */
export function parsePaginationFromSearchParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): PaginationState {
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] || null : value || null;
  };

  const page = parseInt(get("page") || "1");
  const limit = parseInt(get("limit") || "20");

  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 20 : Math.max(1, Math.min(100, limit)),
  };
}

/**
 * Convert filter values to URL search parameters
 */
export function serializeFiltersToSearchParams(
  filters: FilterValues,
  pagination: PaginationState,
): URLSearchParams {
  const params = new URLSearchParams();

  // Search
  if (filters.search) {
    params.set("q", filters.search);
  }

  // Challenge level range
  if (filters.challengeLevelRange[0] > 1) {
    params.set("min_cl", filters.challengeLevelRange[0].toString());
  }
  if (filters.challengeLevelRange[1] < 100) {
    params.set("max_cl", filters.challengeLevelRange[1].toString());
  }

  // Types
  if (filters.types.length > 0) {
    params.set("types", filters.types.join(","));
  }

  // Speed types
  if (filters.speedType.length > 0) {
    params.set("speed", filters.speedType.join(","));
  }

  // Alignment
  if (filters.alignment.length > 0) {
    params.set("alignment", filters.alignment.join(","));
  }

  // Monster source
  if (filters.monsterSource !== "all") {
    params.set("type", filters.monsterSource);
  }

  // View mode
  if (filters.view === "table") {
    params.set("view", "table");
  }

  // Pagination
  if (pagination.page > 1) {
    params.set("page", pagination.page.toString());
  }
  if (pagination.limit !== 20) {
    params.set("limit", pagination.limit.toString());
  }

  return params;
}
