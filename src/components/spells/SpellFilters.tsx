"use client";

import { Search, Filter, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { MultiSelect } from "../../../components/ui/multi-select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";

interface FilterValues {
  search: string;
  tierRange: [number, number];
  tiers: number[];
  classes: string[];
  durations: string[];
  ranges: string[];
  sources: string[];
}

interface SpellFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableClasses?: string[];
  availableDurations?: string[];
  availableRanges?: string[];
  availableSources?: string[];
  loading?: boolean;
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  tierRange: [1, 5],
  tiers: [],
  classes: [],
  durations: [],
  ranges: [],
  sources: [],
};

export function SpellFilters({
  filters,
  onFiltersChange,
  availableClasses = [],
  availableDurations = [],
  availableRanges = [],
  availableSources = [],
  loading = false,
}: SpellFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  const [debouncedSearch] = useDebounce(localSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch,
      });
    }
  }, [debouncedSearch]);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.tiers.length > 0 ||
    filters.classes.length > 0 ||
    filters.durations.length > 0 ||
    filters.ranges.length > 0 ||
    filters.sources.length > 0;

  const activeFilterCount = [
    filters.search !== "",
    filters.tiers.length > 0,
    filters.classes.length > 0,
    filters.durations.length > 0,
    filters.ranges.length > 0,
    filters.sources.length > 0,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search spells by name or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              disabled={loading}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant={expanded ? "default" : "outline"}
                  className="gap-2"
                >
                  <Filter size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="text-xs">({activeFilterCount})</span>
                  )}
                  {expanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                title="Clear all filters"
                className="text-destructive hover:text-destructive"
              >
                <FilterX size={16} />
              </Button>
            )}
          </div>
        </div>

        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleContent>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MultiSelect
                    label="Tiers"
                    placeholder="Select tiers"
                    options={[1, 2, 3, 4, 5].map((tier) => ({
                      value: tier.toString(),
                      label: `Tier ${tier}`,
                    }))}
                    selected={filters.tiers.map((t) => t.toString())}
                    onChange={(value) =>
                      handleFilterChange(
                        "tiers",
                        value.map((v) => parseInt(v)),
                      )
                    }
                    clearable
                    disabled={loading}
                  />
                  <MultiSelect
                    label="Classes"
                    placeholder="Select classes"
                    options={availableClasses.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    selected={filters.classes}
                    onChange={(value) => handleFilterChange("classes", value)}
                    searchable
                    clearable
                    disabled={loading}
                  />

                  <MultiSelect
                    label="Durations"
                    placeholder="Select durations"
                    options={availableDurations.map((d) => ({
                      value: d,
                      label: d,
                    }))}
                    selected={filters.durations}
                    onChange={(value) => handleFilterChange("durations", value)}
                    searchable
                    clearable
                    disabled={loading}
                  />

                  <MultiSelect
                    label="Ranges"
                    placeholder="Select ranges"
                    options={availableRanges.map((r) => ({
                      value: r,
                      label: r,
                    }))}
                    selected={filters.ranges}
                    onChange={(value) => handleFilterChange("ranges", value)}
                    searchable
                    clearable
                    disabled={loading}
                  />

                  <MultiSelect
                    label="Sources"
                    placeholder="Select sources"
                    options={availableSources.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    selected={filters.sources}
                    onChange={(value) => handleFilterChange("sources", value)}
                    searchable
                    clearable
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters || loading}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
