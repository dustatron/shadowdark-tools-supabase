// Utility functions for the Shadowdark Monster Manager
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

export const generateBackUrl = (
  resolvedSearchParams: Record<string, string | string[] | undefined>,
) => {
  const params = new URLSearchParams();

  // Preserve all relevant search parameters
  const q = resolvedSearchParams.q || resolvedSearchParams.search;
  if (q && typeof q === "string") params.set("q", q);

  const minCl = resolvedSearchParams.min_cl;
  if (minCl && typeof minCl === "string") params.set("min_cl", minCl);

  const maxCl = resolvedSearchParams.max_cl;
  if (maxCl && typeof maxCl === "string") params.set("max_cl", maxCl);

  const types = resolvedSearchParams.types;
  if (types && typeof types === "string") params.set("types", types);

  const speed = resolvedSearchParams.speed;
  if (speed && typeof speed === "string") params.set("speed", speed);

  const type = resolvedSearchParams.type || resolvedSearchParams.source;
  if (type && typeof type === "string" && type !== "all")
    params.set("type", type);

  const page = resolvedSearchParams.page;
  if (page && typeof page === "string" && page !== "1")
    params.set("page", page);

  const limit = resolvedSearchParams.limit;
  if (limit && typeof limit === "string" && limit !== "20")
    params.set("limit", limit);

  const queryString = params.toString();
  return queryString ? `/monsters?${queryString}` : "/monsters";
};
