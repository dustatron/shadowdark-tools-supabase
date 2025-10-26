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
];

export interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  speedType: string[];
  monsterSource: "all" | "official" | "custom";
}

export interface PaginationState {
  page: number;
  limit: number;
}

export const DEFAULT_FILTERS: FilterValues = {
  search: "",
  challengeLevelRange: [1, 20],
  types: [],
  speedType: [],
  monsterSource: "all",
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
  const maxCl = parseInt(get("max_cl") || "20");
  const challengeLevelRange: [number, number] = [
    isNaN(minCl) ? 1 : Math.max(1, Math.min(20, minCl)),
    isNaN(maxCl) ? 20 : Math.max(1, Math.min(20, maxCl)),
  ];

  const typesParam = get("types");
  const types = typesParam ? typesParam.split(",").filter(Boolean) : [];

  const speedParam = get("speed");
  const speedType = speedParam ? speedParam.split(",").filter(Boolean) : [];

  const sourceParam = get("type") || get("source") || "all";
  const monsterSource =
    sourceParam === "official" || sourceParam === "custom"
      ? sourceParam
      : "all";

  return {
    search,
    challengeLevelRange,
    types,
    speedType,
    monsterSource,
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
  if (filters.challengeLevelRange[1] < 20) {
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

  // Monster source
  if (filters.monsterSource !== "all") {
    params.set("type", filters.monsterSource);
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
