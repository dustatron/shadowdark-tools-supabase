"use client";

import { useState, useEffect } from "react";
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
import { logger } from "@/lib/utils/logger";
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

export default function MagicItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AllMagicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const { view, setView } = useViewMode();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const currentUserId = user?.id ?? null;
  const [favoritesMap, setFavoritesMap] = useState<Map<string, string>>(
    new Map(),
  );

  // Available filter options
  const [availableTraitTypes] = useState<string[]>([
    "Benefit",
    "Curse",
    "Bonus",
    "Personality",
  ]);

  useEffect(() => {
    fetchMagicItems();
  }, [filters, pagination.page, pagination.limit]);

  // Fetch user favorites when user changes
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoritesMap(new Map());
        return;
      }

      const supabase = createClient();
      const { data: favorites } = await supabase
        .from("favorites")
        .select("id, item_id")
        .eq("user_id", user.id)
        .eq("item_type", "magic_item");

      if (favorites) {
        const favMap = createFavoritesMap(
          favorites.map((fav: { id: string; item_id: string }) => ({
            item_id: fav.item_id,
            favorite_id: fav.id,
          })),
        );
        setFavoritesMap(favMap);
      }
    };
    fetchFavorites();
  }, [user]);

  const fetchMagicItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
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

      const response = await fetch(
        `/api/search/magic-items?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch magic items");
      }

      const result = await response.json();

      setItems(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination?.totalCount || 0,
        totalPages: result.pagination?.totalPages || 0,
      }));
    } catch (err) {
      logger.error("Error fetching magic items:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));
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
          loading={loading}
        />
      </div>

      <MagicItemList
        items={items}
        pagination={pagination}
        loading={loading}
        error={error || undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchMagicItems}
        view={view}
      />
    </div>
  );
}
