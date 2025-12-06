"use client";

import { useState, useEffect } from "react";
import { MagicItemList } from "@/components/magic-items/MagicItemList";
import { MagicItemFilters } from "@/components/magic-items/MagicItemFilters";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
  item_type?: "official" | "custom";
  creator_name?: string | null;
  user_id?: string | null;
}

interface FilterValues {
  search: string;
  traitTypes: string[];
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  traitTypes: [],
};

export default function MagicItemsPage() {
  const [items, setItems] = useState<MagicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

  useEffect(() => {
    const checkAuthAndFavorites = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);

      // Fetch user's favorite magic items if authenticated
      if (user) {
        const { data: favorites } = await supabase
          .from("favorites")
          .select("id, item_id")
          .eq("user_id", user.id)
          .eq("item_type", "magic_item");

        if (favorites) {
          const favMap = createFavoritesMap(
            favorites.map((fav) => ({
              item_id: fav.item_id,
              favorite_id: fav.id,
            })),
          );
          setFavoritesMap(favMap);
        }
      }
    };
    checkAuthAndFavorites();
  }, []);

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

      const response = await fetch(
        `/api/search/magic-items?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch magic items");
      }

      const data = await response.json();

      setItems(data.results || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.pagination.totalPages || 0,
      }));
    } catch (err) {
      console.error("Error fetching magic items:", err);
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
        <div className="flex gap-2">
          {isAuthenticated && (
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
      />
    </div>
  );
}
