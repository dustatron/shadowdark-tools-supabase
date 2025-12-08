"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MonsterList } from "@/src/components/monsters/MonsterList";
import { MonsterFilters } from "@/src/components/monsters/MonsterFilters";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LayoutGrid, Plus, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FilterValues,
  PaginationState,
  serializeFiltersToSearchParams,
  ViewMode,
} from "@/lib/types/monsters";
import { useViewMode } from "@/lib/hooks";

interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{
    name: string;
    type: "melee" | "ranged";
    damage: string;
    range: string;
    description?: string;
  }>;
  abilities: Array<{
    name: string;
    description: string;
  }>;
  tags: {
    type: string[];
    location: string[];
  };
  source: string;
  author_notes?: string;
  monster_type?: "official" | "user";
  creator_id?: string;
}

interface MonstersClientProps {
  currentUserId: string | null;
  initialFavoritesMap: Map<string, string>;
  initialFilters: FilterValues;
  initialPagination: PaginationState;
}

export function MonstersClient({
  currentUserId,
  initialFavoritesMap,
  initialFilters,
  initialPagination,
}: MonstersClientProps) {
  const router = useRouter();
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [pagination, setPagination] = useState({
    ...initialPagination,
    total: 0,
    totalPages: 0,
  });

  const [favoritesMap, setFavoritesMap] =
    useState<Map<string, string>>(initialFavoritesMap);

  // Global view mode with localStorage persistence
  const { view, setView } = useViewMode(initialFilters.view);

  // Available filter options
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  useEffect(() => {
    fetchMonsters();
  }, [filters, pagination.page, pagination.limit]);

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
            const favMap = new Map(
              favorites.map((fav) => [fav.item_id, fav.id]),
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

  const fetchMonsters = async () => {
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

      if (filters.challengeLevelRange[1] < 20) {
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

        data.monsters.forEach((monster: Monster) => {
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
      console.error("Error fetching monsters:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update URL when filters or pagination change
  const updateURL = (
    newFilters: FilterValues,
    newPagination: { page: number; limit: number },
  ) => {
    const params = serializeFiltersToSearchParams(newFilters, newPagination);
    const queryString = params.toString();

    // Use router.push to update URL without page reload
    router.push(queryString ? `/monsters?${queryString}` : "/monsters", {
      scroll: false,
    });
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const newPagination = { ...pagination, page: 1 };
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters change

    // Update URL
    updateURL(newFilters, newPagination);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));

    // Update URL with new page
    updateURL(filters, { page, limit: pagination.limit });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));

    // Update URL with new page size
    updateURL(filters, { page: 1, limit: pageSize });
  };

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:justify-end mb-6">
        {currentUserId && (
          <Button asChild>
            <Link href="/monsters/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Monster
            </Link>
          </Button>
        )}
        <div className="flex border rounded-md">
          <Button
            variant={view === "cards" ? "default" : "ghost"}
            size="icon"
            onClick={() => handleViewChange("cards")}
            title="Card view"
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => handleViewChange("table")}
            title="Table view"
            className="rounded-l-none"
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <MonsterFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTypes={availableTypes}
          availableSources={availableSources}
          loading={loading}
          view={view}
          onViewChange={handleViewChange}
        />
      </div>

      <MonsterList
        monsters={monsters}
        pagination={pagination}
        loading={loading}
        error={error || undefined}
        currentUserId={currentUserId || undefined}
        favoritesMap={favoritesMap}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchMonsters}
        preserveSearchParams={true}
        view={view}
      />
    </div>
  );
}
