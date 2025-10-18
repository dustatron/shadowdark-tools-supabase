"use client";

import { useState, useEffect } from "react";
import { SpellList } from "@/src/components/spells/SpellList";
import { SpellFilters } from "@/src/components/spells/SpellFilters";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  classes: string[];
  durations: string[];
  ranges: string[];
  sources: string[];
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  tierRange: [1, 5],
  classes: [],
  durations: [],
  ranges: [],
  sources: [],
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

  // Available filter options
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);
  const [availableRanges, setAvailableRanges] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  useEffect(() => {
    fetchSpells();
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
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
      if (filters.tierRange[0] > 1) {
        params.append("minTier", filters.tierRange[0].toString());
      }
      if (filters.tierRange[1] < 5) {
        params.append("maxTier", filters.tierRange[1].toString());
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

      // Extract unique filter options from results
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
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
          Spells
        </h1>
        {isAuthenticated && (
          <Link
            href="/spells/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#228be6",
              color: "white",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Spell
          </Link>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchSpells}
      />
    </div>
  );
}
