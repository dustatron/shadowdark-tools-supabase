"use client";

import { Filter, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/primitives/card";
import { Button } from "@/components/primitives/button";
import { MultiSelect } from "@/components/primitives/multi-select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/primitives/collapsible";
import { SourceToggle } from "@/components/shared/SourceToggle";
import { SearchInput } from "@/components/shared/SearchInput";
import type { SpellFilterValues, SpellFiltersProps } from "@/lib/types/spells";
import { DEFAULT_SPELL_FILTERS } from "@/lib/types/spells";

const DEFAULT_FILTERS: SpellFilterValues = DEFAULT_SPELL_FILTERS;

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

  const handleFilterChange = (key: keyof SpellFilterValues, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.tiers.length > 0 ||
    filters.classes.length > 0 ||
    filters.durations.length > 0 ||
    filters.ranges.length > 0 ||
    filters.sources.length > 0 ||
    filters.spellSource !== "all";

  const activeFilterCount = [
    filters.search !== "",
    filters.tiers.length > 0,
    filters.classes.length > 0,
    filters.durations.length > 0,
    filters.ranges.length > 0,
    filters.sources.length > 0,
    filters.spellSource !== "all",
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Spell Source Filter */}
        <SourceToggle
          value={filters.spellSource}
          onChange={(value) => handleFilterChange("spellSource", value)}
          labels={{
            all: "All Spells",
            official: "Core Spells",
            custom: "Custom Spells",
          }}
          disabled={loading}
        />

        <div className="flex flex-col gap-4">
          <SearchInput
            value={filters.search}
            onChange={(value) => handleFilterChange("search", value)}
            placeholder="Search spells by name or description..."
            disabled={loading}
            debounceMs={300}
          />

          <div className="flex gap-2 justify-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                title="Clear all filters"
                aria-label="Clear all filters"
                className="text-destructive hover:text-destructive"
              >
                <FilterX size={16} />
              </Button>
            )}

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
