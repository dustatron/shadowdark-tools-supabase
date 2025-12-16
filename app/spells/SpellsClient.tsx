"use client";

import { useState, useEffect, useCallback } from "react";
import { SpellList } from "@/components/spells/SpellList";
import { SpellFilters } from "@/components/spells/SpellFilters";
import { Button } from "@/components/primitives/button";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useViewMode } from "@/lib/hooks";
import { logger } from "@/lib/utils/logger";
import type { AllSpell, SpellFilterValues } from "@/lib/types/spells";
import { DEFAULT_SPELL_FILTERS } from "@/lib/types/spells";
import type { ViewMode } from "@/lib/types/monsters";

interface SpellsClientProps {
  currentUserId: string | null;
  initialFavoritesMap: Map<string, string>;
  initialInListsSet: Set<string>;
  initialInDecksSet: Set<string>;
}

export function SpellsClient({
  currentUserId,
  initialFavoritesMap,
  initialInListsSet,
  initialInDecksSet,
}: SpellsClientProps) {
  const [spells, setSpells] = useState<AllSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SpellFilterValues>(
    DEFAULT_SPELL_FILTERS,
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [favoritesMap, setFavoritesMap] =
    useState<Map<string, string>>(initialFavoritesMap);
  const [inListsSet, setInListsSet] = useState<Set<string>>(initialInListsSet);
  const [inDecksSet, setInDecksSet] = useState<Set<string>>(initialInDecksSet);

  // Global view mode with localStorage persistence
  const { view, setView } = useViewMode();

  // Available filter options
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);
  const [availableRanges, setAvailableRanges] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Memoize fetchSpells
  const fetchSpells = useCallback(async () => {
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

      setSpells(data.results || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.pagination.totalPages || 0,
      }));
    } catch (err) {
      logger.error("Error fetching spells:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSpells();
  }, [fetchSpells]);

  useEffect(() => {
    // Fetch all filter options on mount
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/search/spells?limit=100");
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
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

            setAvailableClasses(Array.from(classes).sort());
            setAvailableDurations(Array.from(durations).sort());
            setAvailableRanges(Array.from(ranges).sort());
            setAvailableSources(Array.from(sources).sort());
          }
        }
      } catch (err) {
        logger.error("Error fetching filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Subscribe to favorites changes
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
        async () => {
          // Refetch favorites when they change
          const { data: favorites } = await supabase
            .from("favorites")
            .select("id, item_id")
            .eq("user_id", currentUserId)
            .eq("item_type", "spell");

          if (favorites) {
            const favMap = new Map<string, string>(
              favorites.map((fav) => [fav.item_id as string, fav.id as string]),
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

  const handleFiltersChange = useCallback((newFilters: SpellFilterValues) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  }, []);

  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      setView(newView);
    },
    [setView],
  );

  // Handle favorite change from action menu
  const handleFavoriteChange = useCallback(
    (spellId: string, favoriteId: string | undefined) => {
      setFavoritesMap((prevMap) => {
        const newMap = new Map(prevMap);
        if (favoriteId) {
          newMap.set(spellId, favoriteId);
        } else {
          newMap.delete(spellId);
        }
        return newMap;
      });
    },
    [],
  );

  // Handle list change from action menu
  const handleListChange = useCallback((spellId: string, inList: boolean) => {
    setInListsSet((prevSet) => {
      const newSet = new Set(prevSet);
      if (inList) {
        newSet.add(spellId);
      } else {
        newSet.delete(spellId);
      }
      return newSet;
    });
  }, []);

  // Handle deck change from action menu
  const handleDeckChange = useCallback((spellId: string, inDeck: boolean) => {
    setInDecksSet((prevSet) => {
      const newSet = new Set(prevSet);
      if (inDeck) {
        newSet.add(spellId);
      } else {
        newSet.delete(spellId);
      }
      return newSet;
    });
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Spells</h1>
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
          loading={loading}
        />
      </div>

      <SpellList
        spells={spells}
        pagination={pagination}
        loading={loading}
        error={error || undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        inListsSet={inListsSet}
        inDecksSet={inDecksSet}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchSpells}
        onFavoriteChange={handleFavoriteChange}
        onListChange={handleListChange}
        onDeckChange={handleDeckChange}
        view={view}
      />
    </div>
  );
}
