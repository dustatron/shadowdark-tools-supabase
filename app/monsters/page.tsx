"use client";

import { useState, useEffect } from "react";
import { MonsterList } from "@/src/components/monsters/MonsterList";
import { MonsterFilters } from "@/src/components/monsters/MonsterFilters";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFavoritesMap } from "@/lib/utils/favorites";

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

interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  speedType: string[];
  monsterSource: "all" | "official" | "custom";
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  challengeLevelRange: [1, 20],
  types: [],
  speedType: [],
  monsterSource: "all",
};

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [favoritesMap, setFavoritesMap] = useState<Map<string, string>>(
    new Map(),
  );

  // Available filter options
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  useEffect(() => {
    fetchMonsters();
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    const checkAuthAndFavorites = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("user?", user);

      setCurrentUserId(user?.id || null);

      // Fetch user's favorite monsters if authenticated
      if (user) {
        const { data: favorites } = await supabase
          .from("favorites")
          .select("id, item_id")
          .eq("user_id", user.id)
          .eq("item_type", "monster");

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

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Monsters</h1>
        {currentUserId && (
          <Button asChild>
            <Link href="/monsters/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Monster
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6">
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchMonsters}
      />
    </div>
  );
}
