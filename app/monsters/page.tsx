"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

interface FetchMonstersParams {
  filters: FilterValues;
  page: number;
  limit: number;
}

interface FetchMonstersResponse {
  monsters: AllMonster[];
  total: number;
  availableTypes: string[];
  availableSources: string[];
}

async function fetchMonsters({
  filters,
  page,
  limit,
}: FetchMonstersParams): Promise<FetchMonstersResponse> {
  const offset = (page - 1) * limit;

  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (filters.search) {
    params.append("q", filters.search);
  }
  if (filters.challengeLevelRange[0] > 1) {
    params.append("min_cl", filters.challengeLevelRange[0].toString());
  }
  if (filters.challengeLevelRange[1] < 100) {
    params.append("max_cl", filters.challengeLevelRange[1].toString());
  }
  if (filters.types.length > 0) {
    params.append("tags", filters.types.join(","));
  }
  if (filters.speedType.length > 0) {
    params.append("speed", filters.speedType.join(","));
  }
  if (filters.alignment.length > 0) {
    params.append("alignment", filters.alignment.join(","));
  }
  if (filters.monsterSource !== "all") {
    params.append("type", filters.monsterSource);
  }

  const response = await fetch(`/api/monsters?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch monsters");
  }

  const data = await response.json();

  // Extract unique filter options from results
  const types = new Set<string>();
  const sources = new Set<string>();

  (data.monsters || []).forEach((monster: AllMonster) => {
    if (monster.tags?.type) {
      monster.tags.type.forEach((t) => types.add(t));
    }
    if (monster.source) {
      sources.add(monster.source);
    }
  });

  return {
    monsters: data.monsters || [],
    total: data.total || 0,
    availableTypes: Array.from(types).sort(),
    availableSources: Array.from(sources).sort(),
  };
}

interface UserMonsterData {
  favoritesMap: Map<string, string>;
  inListsSet: Set<string>;
}

async function fetchUserMonsterData(userId: string): Promise<UserMonsterData> {
  const supabase = createClient();

  const [favoritesResult, listItemsResult] = await Promise.all([
    supabase
      .from("favorites")
      .select("id, item_id")
      .eq("user_id", userId)
      .eq("item_type", "monster"),
    supabase
      .from("adventure_list_items")
      .select("item_id, adventure_lists!inner(user_id)")
      .eq("item_type", "monster")
      .eq("adventure_lists.user_id", userId),
  ]);

  const favoritesMap = favoritesResult.data
    ? createFavoritesMap(
        favoritesResult.data.map((fav: { id: string; item_id: string }) => ({
          item_id: fav.item_id,
          favorite_id: fav.id,
        })),
      )
    : new Map();

  const inListsSet = listItemsResult.data
    ? new Set(
        listItemsResult.data.map((item: { item_id: string }) => item.item_id),
      )
    : new Set<string>();

  return { favoritesMap, inListsSet };
}

export default function MonstersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Parse initial values from URL
  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "20", 10);

  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const currentUserId = user?.id ?? null;
  const { view, setView } = useViewMode(initialFilters.view);

  // Fetch monsters
  const {
    data: monstersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["monsters", { filters, page, limit }],
    queryFn: () => fetchMonsters({ filters, page, limit }),
  });

  // Fetch user data (favorites, lists)
  const { data: userData } = useQuery({
    queryKey: ["user-monster-data", user?.id],
    queryFn: () => fetchUserMonsterData(user!.id),
    enabled: !!user,
  });

  const monsters = monstersData?.monsters ?? [];
  const total = monstersData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const pagination = { page, limit, total, totalPages };

  const favoritesMap = userData?.favoritesMap ?? new Map();
  const inListsSet = userData?.inListsSet ?? new Set<string>();
  const availableTypes = monstersData?.availableTypes ?? [];
  const availableSources = monstersData?.availableSources ?? [];

  // Subscribe to favorites changes for realtime updates
  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("monster-favorites-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["user-monster-data", currentUserId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  const updateURL = useCallback(
    (
      newFilters: FilterValues,
      newPagination: { page: number; limit: number },
    ) => {
      const params = serializeFiltersToSearchParams(newFilters, newPagination);
      const queryString = params.toString();

      router.push(queryString ? `/monsters?${queryString}` : "/monsters", {
        scroll: false,
      });
    },
    [router],
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      setPage(1);
      updateURL(newFilters, { page: 1, limit });
    },
    [limit, updateURL],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateURL(filters, { page: newPage, limit });
    },
    [filters, limit, updateURL],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setLimit(pageSize);
      setPage(1);
      updateURL(filters, { page: 1, limit: pageSize });
    },
    [filters, updateURL],
  );

  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      setView(newView);
    },
    [setView],
  );

  // Optimistic update handlers - update query cache directly
  const handleFavoriteChange = useCallback(
    (monsterId: string, favoriteId: string | undefined) => {
      queryClient.setQueryData(
        ["user-monster-data", currentUserId],
        (oldData: UserMonsterData | undefined) => {
          if (!oldData) return oldData;
          const newFavoritesMap = new Map(oldData.favoritesMap);
          if (favoriteId) {
            newFavoritesMap.set(monsterId, favoriteId);
          } else {
            newFavoritesMap.delete(monsterId);
          }
          return { ...oldData, favoritesMap: newFavoritesMap };
        },
      );
    },
    [queryClient, currentUserId],
  );

  const handleListChange = useCallback(
    (monsterId: string, inList: boolean) => {
      queryClient.setQueryData(
        ["user-monster-data", currentUserId],
        (oldData: UserMonsterData | undefined) => {
          if (!oldData) return oldData;
          const newInListsSet = new Set(oldData.inListsSet);
          if (inList) {
            newInListsSet.add(monsterId);
          } else {
            newInListsSet.delete(monsterId);
          }
          return { ...oldData, inListsSet: newInListsSet };
        },
      );
    },
    [queryClient, currentUserId],
  );

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
          loading={isLoading}
        />
      </div>

      <MonsterList
        monsters={monsters}
        pagination={pagination}
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        inListsSet={inListsSet}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={() => refetch()}
        onFavoriteChange={handleFavoriteChange}
        onListChange={handleListChange}
        preserveSearchParams={true}
        view={view}
      />
    </div>
  );
}
