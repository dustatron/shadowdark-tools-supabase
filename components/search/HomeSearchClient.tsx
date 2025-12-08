"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedSearchForm } from "./UnifiedSearchForm";
import { SearchResultsList } from "./SearchResultsList";
import type { SearchFormValues } from "@/lib/validations/search";
import type { SearchResponse } from "@/lib/types/search";

async function searchContent(
  params: SearchFormValues,
): Promise<SearchResponse> {
  const searchParams = new URLSearchParams({
    q: params.q,
    source: params.source,
    includeMonsters: String(params.includeMonsters),
    includeMagicItems: String(params.includeMagicItems),
    includeEquipment: String(params.includeEquipment),
    limit: params.limit,
  });

  const response = await fetch(`/api/search?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Search failed");
  }

  return response.json();
}

export function HomeSearchClient() {
  const [searchParams, setSearchParams] = useState<SearchFormValues | null>(
    null,
  );
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", searchParams],
    queryFn: () => searchContent(searchParams!),
    enabled: !!searchParams,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSubmit = (values: SearchFormValues) => {
    setSearchParams(values);
    setHasSearched(true);
  };

  return (
    <div className="space-y-8">
      <UnifiedSearchForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}

      <SearchResultsList
        results={data?.results ?? []}
        isLoading={isLoading}
        total={data?.total}
        hasSearched={hasSearched}
      />
    </div>
  );
}
