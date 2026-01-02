"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagicItemList } from "@/components/magic-items/MagicItemList";
import { MagicItemFilters } from "@/components/magic-items/MagicItemFilters";
import { Button } from "@/components/primitives/button";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { createClient } from "@/lib/supabase/client";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { useViewMode } from "@/lib/hooks";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";
import type {
  AllMagicItem,
  MagicItemFilterValues,
} from "@/lib/types/magic-items";
import { DEFAULT_MAGIC_ITEM_FILTERS } from "@/lib/types/magic-items";

// Map itemSource to source for compatibility
interface FilterValues extends Omit<MagicItemFilterValues, "source"> {
  itemSource: "all" | "official" | "custom";
}

const DEFAULT_FILTERS: FilterValues = {
  ...DEFAULT_MAGIC_ITEM_FILTERS,
  itemSource: "all",
};

interface FetchMagicItemsParams {
  filters: FilterValues;
  page: number;
  limit: number;
}

interface FetchMagicItemsResponse {
  data: AllMagicItem[];
  pagination: {
    totalCount: number;
    totalPages: number;
  };
}

async function fetchMagicItems({
  filters,
  page,
  limit,
}: FetchMagicItemsParams): Promise<FetchMagicItemsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.search) {
    params.append("q", filters.search);
  }
  if (filters.traitTypes.length > 0) {
    params.append("traitTypes", filters.traitTypes.join(","));
  }
  if (filters.itemSource !== "all") {
    params.append("source", filters.itemSource);
  }

  const response = await fetch(`/api/search/magic-items?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch magic items");
  }

  const result = await response.json();

  return {
    data: result.data || [],
    pagination: result.pagination || { totalCount: 0, totalPages: 0 },
  };
}

async function fetchFavorites(userId: string): Promise<Map<string, string>> {
  const supabase = createClient();
  const { data: favorites } = await supabase
    .from("favorites")
    .select("id, item_id")
    .eq("user_id", userId)
    .eq("item_type", "magic_item");

  if (favorites) {
    return createFavoritesMap(
      favorites.map((fav: { id: string; item_id: string }) => ({
        item_id: fav.item_id,
        favorite_id: fav.id,
      })),
    );
  }

  return new Map();
}

export default function MagicItemsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const { view, setView } = useViewMode();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const currentUserId = user?.id ?? null;

  // Available filter options
  const [availableTraitTypes] = useState<string[]>([
    "Benefit",
    "Curse",
    "Bonus",
    "Personality",
  ]);

  const {
    data: itemsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["magic-items", { filters, page, limit }],
    queryFn: () => fetchMagicItems({ filters, page, limit }),
  });

  const { data: favoritesMap = new Map() } = useQuery({
    queryKey: ["favorites", "magic_item", user?.id],
    queryFn: () => fetchFavorites(user!.id),
    enabled: !!user,
  });

  const items = itemsData?.data ?? [];
  const pagination = {
    page,
    limit,
    total: itemsData?.pagination?.totalCount ?? 0,
    totalPages: itemsData?.pagination?.totalPages ?? 0,
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setLimit(pageSize);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Magic Items</h1>
          <p className="text-muted-foreground mt-1">
            Browse official and community magic items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle view={view} onViewChange={setView} />
          {user && (
            <>
              <Button variant="outline" asChild>
                <Link href="/magic-items/my-items">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Items
                </Link>
              </Button>
              <Button asChild>
                <Link href="/magic-items/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Item
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <MagicItemFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTraitTypes={availableTraitTypes}
          loading={isLoading}
        />
      </div>

      <MagicItemList
        items={items}
        pagination={pagination}
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={() => refetch()}
        view={view}
      />
    </div>
  );
}
