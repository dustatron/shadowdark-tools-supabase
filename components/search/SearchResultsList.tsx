"use client";

import { SearchResultCard } from "./SearchResultCard";
import { Loader2, Search } from "lucide-react";
import type { SearchResult } from "@/lib/types/search";

interface SearchResultsListProps {
  results: SearchResult[];
  isLoading: boolean;
  total?: number;
  hasSearched?: boolean;
}

export function SearchResultsList({
  results,
  isLoading,
  total,
  hasSearched = true,
}: SearchResultsListProps) {
  // Initial state - no search performed yet
  if (!hasSearched && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Enter a search term to find monsters, magic items, and equipment
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Searching...</p>
      </div>
    );
  }

  // Empty results after search
  if (results.length === 0 && hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No results found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try a different search term or adjust your filters
        </p>
      </div>
    );
  }

  // Results found
  return (
    <div className="space-y-4">
      {total !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing {results.length} of {total} results
        </p>
      )}
      <div className="grid gap-3">
        {results.map((result) => (
          <SearchResultCard
            key={`${result.type}-${result.id}`}
            result={result}
          />
        ))}
      </div>
    </div>
  );
}
