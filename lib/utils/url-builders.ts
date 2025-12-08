/**
 * URL building utilities for consistent navigation with search params.
 */

const PARAM_MAPPINGS: Record<string, string[]> = {
  q: ["q", "search"],
  min_cl: ["min_cl"],
  max_cl: ["max_cl"],
  types: ["types"],
  speed: ["speed"],
  type: ["type", "source"],
  page: ["page"],
  limit: ["limit"],
};

const DEFAULT_VALUES: Record<string, string> = {
  page: "1",
  limit: "20",
  type: "all",
};

/**
 * Build monster detail URL preserving search params
 */
export function buildMonsterDetailUrl(
  monsterId: string,
  searchParams: URLSearchParams | null,
  preserveParams = false,
): string {
  if (!preserveParams || !searchParams) {
    return `/monsters/${monsterId}`;
  }

  const params = new URLSearchParams();

  for (const [key, sources] of Object.entries(PARAM_MAPPINGS)) {
    const value = sources.map((s) => searchParams.get(s)).find((v) => v);
    if (value && value !== DEFAULT_VALUES[key]) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString
    ? `/monsters/${monsterId}?${queryString}`
    : `/monsters/${monsterId}`;
}

/**
 * Build spell detail URL preserving search params
 */
export function buildSpellDetailUrl(
  spellSlug: string,
  searchParams: URLSearchParams | null,
  preserveParams = false,
): string {
  if (!preserveParams || !searchParams) {
    return `/spells/${spellSlug}`;
  }

  const params = new URLSearchParams();
  const q = searchParams.get("q") || searchParams.get("search");
  if (q) params.set("q", q);

  const tier = searchParams.get("tier");
  if (tier && tier !== "all") params.set("tier", tier);

  const source = searchParams.get("source");
  if (source && source !== "all") params.set("source", source);

  const queryString = params.toString();
  return queryString
    ? `/spells/${spellSlug}?${queryString}`
    : `/spells/${spellSlug}`;
}

/**
 * Build list URL with pagination
 */
export function buildListUrl(
  basePath: string,
  filters: Record<string, string | number | undefined>,
  pagination?: { page?: number; limit?: number },
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== DEFAULT_VALUES[key]) {
      params.set(key, String(value));
    }
  }

  if (pagination?.page && pagination.page !== 1) {
    params.set("page", String(pagination.page));
  }
  if (pagination?.limit && pagination.limit !== 20) {
    params.set("limit", String(pagination.limit));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
