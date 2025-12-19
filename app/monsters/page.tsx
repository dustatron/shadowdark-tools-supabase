"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MonsterList } from "@/components/monsters/MonsterList";
import { MonsterFilters } from "@/components/monsters/MonsterFilters";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FilterValues,
  DEFAULT_FILTERS,
  serializeFiltersToSearchParams,
  ViewMode,
  AllMonster,
} from "@/lib/types/monsters";
import { useViewMode } from "@/lib/hooks";
import { logger } from "@/lib/utils/logger";

// Parse filters from URL search params
function parseFiltersFromSearchParams(params: URLSearchParams): FilterValues {
  const search = params.get("q") || "";
  const minCl = params.get("min_cl");
  const maxCl = params.get("max_cl");
  const types = params.get("tags")?.split(",").filter(Boolean) || [];
  const speedType = params.get("speed")?.split(",").filter(Boolean) || [];
  const alignment = params.get("alignment")?.split(",").filter(Boolean) || [];
  const typeParam = params.get("type");
  const monsterSource: "all" | "official" | "custom" =
    typeParam === "user"
      ? "custom"
      : typeParam === "official"
        ? "official"
        : "all";
  const view = (params.get("view") as ViewMode) || "cards";

  return {
    search,
    challengeLevelRange: [
      minCl ? parseInt(minCl, 10) : 1,
      maxCl ? parseInt(maxCl, 10) : 100,
    ],
    types,
    speedType,
    alignment,
    monsterSource,
    view,
  };
}

export default function MonstersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Parse initial values from URL
  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "20", 10);

  const [monsters, setMonsters] = useState<AllMonster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const currentUserId = user?.id ?? null;
  const [favoritesMap, setFavoritesMap] = useState<Map<string, string>>(
    new Map(),
  );
  const [inListsSet, setInListsSet] = useState<Set<string>>(new Set());

  // Global view mode with localStorage persistence
  const { view, setView } = useViewMode(initialFilters.view);

  // Available filter options
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Fetch user favorites and list items when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setFavoritesMap(new Map());
        setInListsSet(new Set());
        return;
      }

      const supabase = createClient();

      // Fetch favorites
      const { data: favorites } = await supabase
        .from("favorites")
        .select("id, item_id")
        .eq("user_id", user.id)
        .eq("item_type", "monster");

      if (favorites) {
        setFavoritesMap(
          createFavoritesMap(
            favorites.map((fav: { id: string; item_id: string }) => ({
              item_id: fav.item_id,
              favorite_id: fav.id,
            })),
          ),
        );
      }

      // Fetch monsters that are in adventure lists
      const { data: listItems } = await supabase
        .from("adventure_list_items")
        .select("item_id, adventure_lists!inner(user_id)")
        .eq("item_type", "monster")
        .eq("adventure_lists.user_id", user.id);

      if (listItems) {
        setInListsSet(
          new Set(listItems.map((item: { item_id: string }) => item.item_id)),
        );
      }
    };
    fetchUserData();
  }, [user]);

  // Memoize fetchMonsters to avoid recreating on every render
  const fetchMonsters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate offset from page and limit
      const offset = (pagination.page - 1) * pagination.limit;

      // Build query parameters - matching the API's expected parameter names
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: pagination.limit.toString(),
      });

      // API expects 'q' for search query
      if (filters.search) {
        params.append("q", filters.search);
      }

      // API expects 'min_cl' and 'max_cl' for challenge level
      if (filters.challengeLevelRange[0] > 1) {
        params.append("min_cl", filters.challengeLevelRange[0].toString());
      }

      if (filters.challengeLevelRange[1] < 100) {
        params.append("max_cl", filters.challengeLevelRange[1].toString());
      }

      // API expects 'tags' for types
      if (filters.types.length > 0) {
        params.append("tags", filters.types.join(","));
      }

      // API expects 'speed' parameter for speed filtering
      if (filters.speedType.length > 0) {
        params.append("speed", filters.speedType.join(","));
      }

      // API expects 'alignment' parameter for alignment filtering
      if (filters.alignment.length > 0) {
        params.append("alignment", filters.alignment.join(","));
      }

      // API expects 'type' parameter for monster source filtering
      if (filters.monsterSource !== "all") {
        params.append("type", filters.monsterSource);
      }

      const response = await fetch(`/api/monsters?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch monsters");
      }

      const data = await response.json();

      setMonsters(data.monsters || []);

      // Calculate total pages from the API response
      const totalPages = Math.ceil((data.total || 0) / pagination.limit);

      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: totalPages,
      }));

      // Extract unique filter options from results
      if (data.monsters && data.monsters.length > 0) {
        const types = new Set<string>();
        const sources = new Set<string>();

        data.monsters.forEach((monster: AllMonster) => {
          if (monster.tags?.type) {
            monster.tags.type.forEach((t) => types.add(t));
          }
          if (monster.source) {
            sources.add(monster.source);
          }
        });

        setAvailableTypes(Array.from(types).sort());
        setAvailableSources(Array.from(sources).sort());
      }
    } catch (err) {
      logger.error("Error fetching monsters:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  // Subscribe to favorites changes
  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("favorites-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
          filter: `user_id=eq.${currentUserId}`,
        },
        async () => {
          // Refetch favorites when they change
          const { data: favorites } = await supabase
            .from("favorites")
            .select("id, item_id")
            .eq("user_id", currentUserId)
            .eq("item_type", "monster");

          if (favorites) {
            const favMap = new Map<string, string>(
              favorites.map((fav: { id: string; item_id: string }) => [
                fav.item_id,
                fav.id,
              ]),
            );
            setFavoritesMap(favMap);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Memoize URL update handler
  const updateURL = useCallback(
    (
      newFilters: FilterValues,
      newPagination: { page: number; limit: number },
    ) => {
      const params = serializeFiltersToSearchParams(newFilters, newPagination);
      const queryString = params.toString();

      // Use router.push to update URL without page reload
      router.push(queryString ? `/monsters?${queryString}` : "/monsters", {
        scroll: false,
      });
    },
    [router],
  );

  // Memoize filters change handler
  const handleFiltersChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      const newPagination = { ...pagination, page: 1 };
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters change

      // Update URL
      updateURL(newFilters, newPagination);
    },
    [pagination, updateURL],
  );

  // Memoize page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));

      // Update URL with new page
      updateURL(filters, { page, limit: pagination.limit });
    },
    [filters, pagination.limit, updateURL],
  );

  // Memoize page size change handler
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));

      // Update URL with new page size
      updateURL(filters, { page: 1, limit: pageSize });
    },
    [filters, updateURL],
  );

  // Memoize view change handler
  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      setView(newView);
    },
    [setView],
  );

  // Handle favorite change from action menu - update favoritesMap immediately
  const handleFavoriteChange = useCallback(
    (monsterId: string, favoriteId: string | undefined) => {
      setFavoritesMap((prevMap) => {
        const newMap = new Map(prevMap);
        if (favoriteId) {
          newMap.set(monsterId, favoriteId);
        } else {
          newMap.delete(monsterId);
        }
        return newMap;
      });
    },
    [],
  );

  // Handle list change from action menu - update inListsSet immediately
  const handleListChange = useCallback((monsterId: string, inList: boolean) => {
    setInListsSet((prevSet) => {
      const newSet = new Set(prevSet);
      if (inList) {
        newSet.add(monsterId);
      } else {
        newSet.delete(monsterId);
      }
      return newSet;
    });
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Monsters</h1>
          <p className="text-muted-foreground mt-1">
            Browse official and community monsters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle view={view} onViewChange={handleViewChange} />
          {currentUserId && (
            <>
              <Button variant="outline" asChild>
                <Link href="/dashboard/monsters">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Monsters
                </Link>
              </Button>
              <Button asChild>
                <Link href="/monsters/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Monster
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <MonsterFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTypes={availableTypes}
          availableSources={availableSources}
          loading={loading}
        />
      </div>

      <MonsterList
        monsters={monsters}
        pagination={pagination}
        loading={loading}
        error={error || undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        inListsSet={inListsSet}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchMonsters}
        onFavoriteChange={handleFavoriteChange}
        onListChange={handleListChange}
        preserveSearchParams={true}
        view={view}
      />
    </div>
  );
}
