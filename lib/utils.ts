// Utility functions for the Shadowdark Monster Manager
import { type ClassValue, clsx } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

export const generateBackUrl = (
  resolvedSearchParams:
    | URLSearchParams
    | ReadonlyURLSearchParams
    | Record<string, string | string[] | undefined>,
  basePath = "/monsters",
) => {
  const params = new URLSearchParams();

  const get = (key: string): string | null => {
    if (
      resolvedSearchParams instanceof URLSearchParams ||
      resolvedSearchParams instanceof ReadonlyURLSearchParams
    ) {
      return resolvedSearchParams.get(key);
    }
    const value = resolvedSearchParams[key];
    return Array.isArray(value) ? value[0] || null : value || null;
  };

  // Preserve all relevant search parameters
  const q = get("q") || get("search");
  if (q) params.set("q", q);

  const minCl = get("min_cl");
  if (minCl) params.set("min_cl", minCl);

  const maxCl = get("max_cl");
  if (maxCl) params.set("max_cl", maxCl);

  const types = get("types");
  if (types) params.set("types", types);

  const speed = get("speed");
  if (speed) params.set("speed", speed);

  const type = get("type") || get("source");
  if (type && type !== "all") params.set("type", type);

  const page = get("page");
  if (page && page !== "1") params.set("page", page);

  const limit = get("limit");
  if (limit && limit !== "20") params.set("limit", limit);

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};
