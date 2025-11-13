"use client";

import { useState, useEffect } from "react";
import { SpellList } from "@/src/components/spells/SpellList";
import { SpellFilters } from "@/src/components/spells/SpellFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createFavoritesMap } from "@/lib/utils/favorites";

interface Spell {
  id: string;
  name: string;
  slug: string;
  description: string;
  classes: string[];
  duration: string;
  range: string;
  tier: number;
  source: string;
  author_notes?: string;
  spell_type?: "official" | "user";
  creator_id?: string;
}

interface FilterValues {
  search: string;
  tierRange: [number, number];
  tiers: number[];
  classes: string[];
  durations: string[];
  ranges: string[];
  sources: string[];
  spellSource: "all" | "official" | "custom";
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  tierRange: [1, 5],
  tiers: [],
  classes: [],
  durations: [],
  ranges: [],
  sources: [],
  spellSource: "all",
};

export default function SpellsPage() {
  const [spells, setSpells] = useState<Spell[]>([]);
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
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);
  const [availableRanges, setAvailableRanges] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  useEffect(() => {
    fetchSpells();
  }, [filters, pagination.page, pagination.limit]);

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

            data.results.forEach((spell: Spell) => {
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
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const checkAuthAndFavorites = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);

      // Fetch user's favorite spells if authenticated
      if (user) {
        const { data: favorites } = await supabase
          .from("favorites")
          .select("id, item_id")
          .eq("user_id", user.id)
          .eq("item_type", "spell");

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

  const fetchSpells = async () => {
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
        // Map "custom" to "user" for API
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
      console.error("Error fetching spells:", err);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Spells</h1>
        {isAuthenticated && (
          <Button asChild>
            <Link href="/spells/create">
              <Plus className="h-4 w-4" />
              Create Spell
            </Link>
          </Button>
        )}
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchSpells}
      />
    </div>
  );
}
