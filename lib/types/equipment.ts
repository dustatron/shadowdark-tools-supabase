export const AVAILABLE_ITEM_TYPES = ["armor", "weapon", "gear"];

export interface EquipmentItem {
  id: string;
  name: string;
  item_type: string;
  cost: {
    amount: number;
    currency: string;
  };
  attack_type?: string;
  range?: string;
  damage?: string;
  armor?: string;
  properties: string[];
  slot: number;
  quantity?: string;
  source_type?: "official" | "custom";
  creator_name?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserEquipment {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  item_type: string;
  cost: {
    amount: number;
    currency: string;
  };
  attack_type?: string;
  range?: string;
  damage?: string;
  armor?: string;
  properties: string[];
  slot: number;
  quantity?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterValues {
  search: string;
  itemType: string[];
}

export interface PaginationState {
  page: number;
  limit: number;
}

export const DEFAULT_FILTERS: FilterValues = {
  search: "",
  itemType: [],
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
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] || null : value || null;
  };

  const search = get("q") || get("search") || "";

  const itemTypeParam = get("itemType");
  const itemType = itemTypeParam
    ? itemTypeParam.split(",").filter(Boolean)
    : [];

  return {
    search,
    itemType,
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

  // Item Type
  if (filters.itemType.length > 0) {
    params.set("itemType", filters.itemType.join(","));
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

export type AllEquipmentItem = EquipmentItem | UserEquipment;
