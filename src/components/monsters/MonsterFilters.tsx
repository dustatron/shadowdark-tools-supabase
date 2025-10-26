"use client";

import { Search, Filter, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  speedType: string[];
  monsterSource: "all" | "official" | "custom";
}

interface MonsterFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableTypes?: string[];
  availableSpeedTypes?: string[];
  availableSources?: string[];
  loading?: boolean;
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  challengeLevelRange: [1, 20],
  types: [],
  speedType: [],
  monsterSource: "all",
};

// Static speed types from all_monsters table
export const AVAILABLE_SPEED_TYPES = [
  "close",
  "close (climb)",
  "close (swim)",
  "double near",
  "double near (burrow)",
  "double near (burrow, swim)",
  "double near (climb)",
  "double near (fly)",
  "double near (fly, swim)",
  "double near (swim)",
  "far (teleport)",
  "near",
  "near (burrow)",
  "near (burrow, climb)",
  "near (climb)",
  "near (climb, fly)",
  "near (climb, swim)",
  "near (fly)",
  "near (swim)",
  "near (swim, fly)",
  "none",
  "triple near (burrow, swim)",
];

export function MonsterFilters({
  filters,
  onFiltersChange,
  availableTypes = [],
  availableSpeedTypes = AVAILABLE_SPEED_TYPES,
  loading = false,
}: MonsterFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
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
    filters.challengeLevelRange[0] !== 1 ||
    filters.challengeLevelRange[1] !== 20 ||
    filters.types.length > 0 ||
    filters.speedType.length > 0 ||
    filters.monsterSource !== "all";

  const activeFilterCount = [
    filters.search !== "",
    filters.challengeLevelRange[0] !== 1 ||
      filters.challengeLevelRange[1] !== 20,
    filters.types.length > 0,
    filters.speedType.length > 0,
    filters.monsterSource !== "all",
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Monster Source Filter */}
          <div className="flex gap-2">
            <Button
              variant={filters.monsterSource === "all" ? "default" : "outline"}
              onClick={() => handleFilterChange("monsterSource", "all")}
              disabled={loading}
              className="flex-1"
            >
              All Monsters
            </Button>
            <Button
              variant={
                filters.monsterSource === "official" ? "default" : "outline"
              }
              onClick={() => handleFilterChange("monsterSource", "official")}
              disabled={loading}
              className="flex-1"
            >
              Core Monsters
            </Button>
            <Button
              variant={
                filters.monsterSource === "custom" ? "default" : "outline"
              }
              onClick={() => handleFilterChange("monsterSource", "custom")}
              disabled={loading}
              className="flex-1"
            >
              User Created
            </Button>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search monsters by name or description..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                disabled={loading}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={expanded ? "default" : "outline"}
                onClick={() => setExpanded(!expanded)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5 ml-2" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 ml-2" />
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  title="Clear all filters"
                >
                  <FilterX className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleContent>
              <div className="flex flex-col gap-4 pt-4 border-t">
                {/* Challenge Level Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Challenge Level Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Min Level
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={filters.challengeLevelRange[0]}
                        onChange={(e) => {
                          const min = parseInt(e.target.value) || 1;
                          handleFilterChange("challengeLevelRange", [
                            Math.min(min, filters.challengeLevelRange[1]),
                            filters.challengeLevelRange[1],
                          ]);
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Max Level
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={filters.challengeLevelRange[1]}
                        onChange={(e) => {
                          const max = parseInt(e.target.value) || 20;
                          handleFilterChange("challengeLevelRange", [
                            filters.challengeLevelRange[0],
                            Math.max(max, filters.challengeLevelRange[0]),
                          ]);
                        }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monster Types */}
                  <MultiSelect
                    label="Monster Types"
                    placeholder="Select types"
                    options={availableTypes.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    selected={filters.types}
                    onChange={(value) => handleFilterChange("types", value)}
                    searchable
                    clearable
                    disabled={loading}
                  />

                  {/* Speed Type */}
                  <MultiSelect
                    label="Speed"
                    placeholder="Select speed types"
                    options={availableSpeedTypes.map((speed) => ({
                      value: speed,
                      label: speed,
                    }))}
                    selected={filters.speedType}
                    onChange={(value) => handleFilterChange("speedType", value)}
                    searchable
                    clearable
                    disabled={loading}
                  />
                </div>

                {/* Filter Actions */}
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
        </div>
      </CardContent>
    </Card>
  );
}
