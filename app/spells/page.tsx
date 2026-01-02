"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SpellList } from "@/components/spells/SpellList";
import { SpellFilters } from "@/components/spells/SpellFilters";
import { Button } from "@/components/primitives/button";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { useViewMode } from "@/lib/hooks";
import { useAuth } from "@/components/providers/AuthProvider";
import type { AllSpell, SpellFilterValues } from "@/lib/types/spells";
import { DEFAULT_SPELL_FILTERS } from "@/lib/types/spells";
import type { ViewMode } from "@/lib/types/monsters";

interface FetchSpellsParams {
  filters: SpellFilterValues;
  page: number;
  limit: number;
}

interface FetchSpellsResponse {
  results: AllSpell[];
  total: number;
  pagination: {
    totalPages: number;
  };
}

async function fetchSpells({
  filters,
  page,
  limit,
}: FetchSpellsParams): Promise<FetchSpellsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.search) {
    params.append("q", filters.search);
  }
  if (filters.tiers.length > 0) {
    params.append("tiers", filters.tiers.join(","));
  }
  if (filters.classes.length > 0) {
    params.append("classes", filters.classes.join(","));
  }
  if (filters.durations.length > 0) {
    params.append("durations", filters.durations.join(","));
  }
  if (filters.ranges.length > 0) {
    params.append("ranges", filters.ranges.join(","));
  }
  if (filters.sources.length > 0) {
    params.append("sources", filters.sources.join(","));
  }
  if (filters.spellSource !== "all") {
    const apiType =
      filters.spellSource === "custom" ? "user" : filters.spellSource;
    params.append("spellTypes", apiType);
  }

  const response = await fetch(`/api/search/spells?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch spells");
  }

  const data = await response.json();

  return {
    results: data.results || [],
    total: data.total || 0,
    pagination: data.pagination || { totalPages: 0 },
  };
}

interface UserSpellData {
  favoritesMap: Map<string, string>;
  inListsSet: Set<string>;
  inDecksSet: Set<string>;
}

async function fetchUserSpellData(userId: string): Promise<UserSpellData> {
  const supabase = createClient();

  const [favoritesResult, listItemsResult, deckItemsResult] = await Promise.all(
    [
      supabase
        .from("favorites")
        .select("id, item_id")
        .eq("user_id", userId)
        .eq("item_type", "spell"),
      supabase
        .from("adventure_list_items")
        .select("item_id, adventure_lists!inner(user_id)")
        .eq("item_type", "spell")
        .eq("adventure_lists.user_id", userId),
      supabase
        .from("deck_items")
        .select("spell_id, decks!inner(user_id)")
        .eq("decks.user_id", userId),
    ],
  );

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

  const inDecksSet = deckItemsResult.data
    ? new Set(
        deckItemsResult.data.map((item: { spell_id: string }) => item.spell_id),
      )
    : new Set<string>();

  return { favoritesMap, inListsSet, inDecksSet };
}

interface FilterOptions {
  classes: string[];
  durations: string[];
  ranges: string[];
  sources: string[];
}

async function fetchFilterOptions(): Promise<FilterOptions> {
  const response = await fetch("/api/search/spells?limit=100");
  if (!response.ok) {
    return { classes: [], durations: [], ranges: [], sources: [] };
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    return { classes: [], durations: [], ranges: [], sources: [] };
  }

  const classes = new Set<string>();
  const durations = new Set<string>();
  const ranges = new Set<string>();
  const sources = new Set<string>();

  data.results.forEach((spell: AllSpell) => {
    spell.classes.forEach((c) => classes.add(c));
    durations.add(spell.duration);
    ranges.add(spell.range);
    sources.add(spell.source);
  });

  return {
    classes: Array.from(classes).sort(),
    durations: Array.from(durations).sort(),
    ranges: Array.from(ranges).sort(),
    sources: Array.from(sources).sort(),
  };
}

export default function SpellsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [filters, setFilters] = useState<SpellFilterValues>(
    DEFAULT_SPELL_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const currentUserId = user?.id ?? null;
  const { view, setView } = useViewMode();

  // Fetch spells
  const {
    data: spellsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["spells", { filters, page, limit }],
    queryFn: () => fetchSpells({ filters, page, limit }),
  });

  // Fetch user data (favorites, lists, decks)
  const { data: userData } = useQuery({
    queryKey: ["user-spell-data", user?.id],
    queryFn: () => fetchUserSpellData(user!.id),
    enabled: !!user,
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["spell-filter-options"],
    queryFn: fetchFilterOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const spells = spellsData?.results ?? [];
  const pagination = {
    page,
    limit,
    total: spellsData?.total ?? 0,
    totalPages: spellsData?.pagination?.totalPages ?? 0,
  };

  const favoritesMap = userData?.favoritesMap ?? new Map();
  const inListsSet = userData?.inListsSet ?? new Set<string>();
  const inDecksSet = userData?.inDecksSet ?? new Set<string>();

  const availableClasses = filterOptions?.classes ?? [];
  const availableDurations = filterOptions?.durations ?? [];
  const availableRanges = filterOptions?.ranges ?? [];
  const availableSources = filterOptions?.sources ?? [];

  // Subscribe to favorites changes for realtime updates
  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("spell-favorites-changes")
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
            queryKey: ["user-spell-data", currentUserId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  const handleFiltersChange = useCallback((newFilters: SpellFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setLimit(pageSize);
    setPage(1);
  }, []);

  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      setView(newView);
    },
    [setView],
  );

  // Optimistic update handlers - update query cache directly
  const handleFavoriteChange = useCallback(
    (spellId: string, favoriteId: string | undefined) => {
      queryClient.setQueryData(
        ["user-spell-data", currentUserId],
        (oldData: UserSpellData | undefined) => {
          if (!oldData) return oldData;
          const newFavoritesMap = new Map(oldData.favoritesMap);
          if (favoriteId) {
            newFavoritesMap.set(spellId, favoriteId);
          } else {
            newFavoritesMap.delete(spellId);
          }
          return { ...oldData, favoritesMap: newFavoritesMap };
        },
      );
    },
    [queryClient, currentUserId],
  );

  const handleListChange = useCallback(
    (spellId: string, inList: boolean) => {
      queryClient.setQueryData(
        ["user-spell-data", currentUserId],
        (oldData: UserSpellData | undefined) => {
          if (!oldData) return oldData;
          const newInListsSet = new Set(oldData.inListsSet);
          if (inList) {
            newInListsSet.add(spellId);
          } else {
            newInListsSet.delete(spellId);
          }
          return { ...oldData, inListsSet: newInListsSet };
        },
      );
    },
    [queryClient, currentUserId],
  );

  const handleDeckChange = useCallback(
    (spellId: string, inDeck: boolean) => {
      queryClient.setQueryData(
        ["user-spell-data", currentUserId],
        (oldData: UserSpellData | undefined) => {
          if (!oldData) return oldData;
          const newInDecksSet = new Set(oldData.inDecksSet);
          if (inDeck) {
            newInDecksSet.add(spellId);
          } else {
            newInDecksSet.delete(spellId);
          }
          return { ...oldData, inDecksSet: newInDecksSet };
        },
      );
    },
    [queryClient, currentUserId],
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Spells</h1>
          <p className="text-muted-foreground mt-1">
            Browse official and community spells
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle view={view} onViewChange={handleViewChange} />
          {currentUserId && (
            <>
              <Button variant="outline" asChild>
                <Link href="/dashboard/spells">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Spells
                </Link>
              </Button>
              <Button asChild>
                <Link href="/spells/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Spell
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <SpellFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableClasses={availableClasses}
          availableDurations={availableDurations}
          availableRanges={availableRanges}
          availableSources={availableSources}
          loading={isLoading}
        />
      </div>

      <SpellList
        spells={spells}
        pagination={pagination}
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        inListsSet={inListsSet}
        inDecksSet={inDecksSet}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={() => refetch()}
        onFavoriteChange={handleFavoriteChange}
        onListChange={handleListChange}
        onDeckChange={handleDeckChange}
        view={view}
      />
    </div>
  );
}
