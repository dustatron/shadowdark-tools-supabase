import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Pagination parameters extracted from URL search params
 */
export interface PaginationParams {
  /** Number of items per page */
  limit: number;
  /** Number of items to skip */
  offset: number;
  /** Current page number (1-indexed) */
  page: number;
}

/**
 * Pagination metadata for response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Sort order options
 */
export type SortOrder = "asc" | "desc";

/**
 * Build pagination parameters from URL search params
 *
 * @param searchParams - URLSearchParams from Next.js request
 * @param defaultLimit - Default page size (default: 20)
 * @param maxLimit - Maximum allowed page size (default: 100)
 * @returns Pagination parameters with limit, offset, and page
 *
 * @example
 * ```ts
 * const params = buildPaginationParams(request.nextUrl.searchParams);
 * // { limit: 20, offset: 0, page: 1 }
 * ```
 */
export const buildPaginationParams = (
  searchParams: URLSearchParams,
  defaultLimit = 20,
  maxLimit = 100,
): PaginationParams => {
  const limitParam = parseInt(
    searchParams.get("limit") || String(defaultLimit),
  );
  const limit = Math.min(
    Math.max(isNaN(limitParam) ? defaultLimit : limitParam, 1),
    maxLimit,
  );
  const pageParam = parseInt(searchParams.get("page") || "1");
  const page = Math.max(isNaN(pageParam) ? 1 : pageParam, 1);
  const offset = (page - 1) * limit;

  return { limit, offset, page };
};

/**
 * Build pagination parameters from limit/offset directly
 *
 * @param searchParams - URLSearchParams from Next.js request
 * @param defaultLimit - Default page size (default: 20)
 * @param maxLimit - Maximum allowed page size (default: 100)
 * @returns Pagination parameters with limit, offset, and page
 *
 * @example
 * ```ts
 * const params = buildPaginationParamsFromOffset(request.nextUrl.searchParams);
 * // { limit: 20, offset: 0, page: 1 }
 * ```
 */
export const buildPaginationParamsFromOffset = (
  searchParams: URLSearchParams,
  defaultLimit = 20,
  maxLimit = 100,
): PaginationParams => {
  const limitParam = parseInt(
    searchParams.get("limit") || String(defaultLimit),
  );
  const limit = Math.min(
    Math.max(isNaN(limitParam) ? defaultLimit : limitParam, 1),
    maxLimit,
  );
  const offsetParam = parseInt(searchParams.get("offset") || "0");
  const offset = Math.max(isNaN(offsetParam) ? 0 : offsetParam, 0);
  const page = Math.floor(offset / limit) + 1;

  return { limit, offset, page };
};

/**
 * Build pagination metadata for API response
 *
 * @param params - Pagination parameters
 * @param total - Total number of items
 * @returns Pagination metadata object
 *
 * @example
 * ```ts
 * const meta = buildPaginationMeta({ limit: 20, offset: 0, page: 1 }, 45);
 * // { page: 1, limit: 20, total: 45, totalPages: 3, hasMore: true }
 * ```
 */
export const buildPaginationMeta = (
  params: PaginationParams,
  total: number,
): PaginationMeta => {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
    hasMore: total > params.offset + params.limit,
  };
};

/**
 * Apply search query to Supabase query builder with fuzzy matching
 *
 * @param query - Supabase query builder
 * @param searchTerm - Search term to apply
 * @param fields - Array of field names to search
 * @param fuzziness - Search fuzziness level ('low' | 'medium' | 'high')
 * @returns Modified query builder
 *
 * @example
 * ```ts
 * let query = supabase.from('monsters').select('*');
 * query = buildSearchQuery(query, 'dragon', ['name', 'source'], 'medium');
 * // Searches name and source with medium fuzziness
 * ```
 */
export const buildSearchQuery = <T>(
  query: any,
  searchTerm: string | undefined,
  fields: string[],
  fuzziness: "low" | "medium" | "high" = "low",
): any => {
  if (!searchTerm || searchTerm.trim() === "") {
    return query;
  }

  const sanitized = sanitizeSearchQuery(searchTerm);
  if (!sanitized) {
    return query;
  }

  const conditions = fields.map((field) => {
    switch (fuzziness) {
      case "high":
        return `${field}.ilike.%${sanitized}%`;
      case "medium":
        return `${field}.ilike.%${sanitized}%`;
      case "low":
      default:
        return `${field}.ilike.${sanitized}%`;
    }
  });

  return query.or(conditions.join(","));
};

/**
 * Apply sorting to Supabase query builder
 *
 * @param query - Supabase query builder
 * @param sortField - Field name to sort by
 * @param sortOrder - Sort direction ('asc' | 'desc')
 * @returns Modified query builder
 *
 * @example
 * ```ts
 * let query = supabase.from('monsters').select('*');
 * query = buildSortQuery(query, 'name', 'asc');
 * // Sorts by name ascending
 * ```
 */
export const buildSortQuery = <T>(
  query: any,
  sortField: string | undefined,
  sortOrder: SortOrder = "asc",
): any => {
  if (!sortField) {
    return query;
  }

  return query.order(sortField, { ascending: sortOrder === "asc" });
};

/**
 * Apply range filter (min/max) to Supabase query builder
 *
 * @param query - Supabase query builder
 * @param field - Field name to filter
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Modified query builder
 *
 * @example
 * ```ts
 * let query = supabase.from('monsters').select('*');
 * query = buildRangeFilter(query, 'challenge_level', 1, 5);
 * // Filters challenge_level between 1 and 5
 * ```
 */
export const buildRangeFilter = (
  query: any,
  field: string,
  min?: number,
  max?: number,
): any => {
  if (min !== undefined) {
    query = query.gte(field, min);
  }
  if (max !== undefined) {
    query = query.lte(field, max);
  }
  return query;
};

/**
 * Apply array contains filter to Supabase query builder
 *
 * @param query - Supabase query builder
 * @param field - Field name to filter (JSONB array field)
 * @param values - Array of values to match
 * @returns Modified query builder
 *
 * @example
 * ```ts
 * let query = supabase.from('spells').select('*');
 * query = buildArrayContainsFilter(query, 'classes', ['wizard']);
 * // Filters spells that contain 'wizard' in classes array
 * ```
 */
export const buildArrayContainsFilter = (
  query: any,
  field: string,
  values?: string[],
): any => {
  if (!values || values.length === 0) {
    return query;
  }

  return query.contains(field, values);
};

/**
 * Apply IN filter to Supabase query builder
 *
 * @param query - Supabase query builder
 * @param field - Field name to filter
 * @param values - Array of values to match
 * @returns Modified query builder
 *
 * @example
 * ```ts
 * let query = supabase.from('monsters').select('*');
 * query = buildInFilter(query, 'speed', ['fast', 'slow']);
 * // Filters monsters with speed 'fast' OR 'slow'
 * ```
 */
export const buildInFilter = (
  query: any,
  field: string,
  values?: string[],
): any => {
  if (!values || values.length === 0) {
    return query;
  }

  return query.in(field, values);
};

/**
 * Parse JSON fields in database results
 *
 * @param data - Array of database records
 * @param fields - Array of field names to parse
 * @returns Array with parsed JSON fields
 *
 * @example
 * ```ts
 * const monsters = parseJsonFields(data, ['attacks', 'abilities', 'tags']);
 * // Parses attacks, abilities, and tags from JSON strings to objects
 * ```
 */
export const parseJsonFields = <T extends Record<string, any>>(
  data: T[],
  fields: string[],
): T[] => {
  return data.map((item) => {
    const parsed = { ...item } as any;
    fields.forEach((field) => {
      if (parsed[field] && typeof parsed[field] === "string") {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (error) {
          console.error(`Failed to parse JSON field ${field}:`, error);
        }
      }
    });
    return parsed as T;
  });
};

/**
 * Sanitize search query to prevent SQL injection
 *
 * @param query - Raw search query string
 * @returns Sanitized query string or empty string if invalid
 *
 * @example
 * ```ts
 * const sanitized = sanitizeSearchQuery("dragon's lair");
 * // Returns "dragons lair"
 * ```
 */
export const sanitizeSearchQuery = (query: string): string => {
  // Remove special characters that could be used for SQL injection
  // Allow: letters, numbers, spaces, hyphens, apostrophes
  return query
    .trim()
    .replace(/[^\w\s'-]/g, "")
    .substring(0, 200); // Max length
};

/**
 * Build complete query with pagination, search, and sorting
 *
 * @param supabase - Supabase client
 * @param table - Table name
 * @param searchParams - URL search parameters
 * @param options - Query options
 * @returns Configured query builder
 *
 * @example
 * ```ts
 * const query = buildQuery(supabase, 'monsters', searchParams, {
 *   searchFields: ['name', 'source'],
 *   defaultSort: 'name'
 * });
 * const { data, count } = await query;
 * ```
 */
export const buildQuery = (
  supabase: SupabaseClient,
  table: string,
  searchParams: URLSearchParams,
  options: {
    searchFields?: string[];
    defaultSort?: string;
    defaultSortOrder?: SortOrder;
    paginationMode?: "page" | "offset";
  } = {},
) => {
  const {
    searchFields = [],
    defaultSort = "created_at",
    defaultSortOrder = "desc",
    paginationMode = "page",
  } = options;

  // Build pagination
  const pagination =
    paginationMode === "offset"
      ? buildPaginationParamsFromOffset(searchParams)
      : buildPaginationParams(searchParams);

  // Start query
  let query = supabase.from(table).select("*", { count: "exact" });

  // Apply search
  const searchTerm = searchParams.get("q") || searchParams.get("search");
  const fuzziness = (searchParams.get("fuzziness") || "low") as
    | "low"
    | "medium"
    | "high";
  if (searchTerm && searchFields.length > 0) {
    query = buildSearchQuery(query, searchTerm, searchFields, fuzziness);
  }

  // Apply sorting
  const sortField = searchParams.get("sort") || defaultSort;
  const sortOrder = (searchParams.get("order") ||
    defaultSortOrder) as SortOrder;
  query = buildSortQuery(query, sortField, sortOrder);

  // Apply pagination
  query = query.range(
    pagination.offset,
    pagination.offset + pagination.limit - 1,
  );

  return { query, pagination };
};
