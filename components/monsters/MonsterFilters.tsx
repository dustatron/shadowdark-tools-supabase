"use client";

import { Filter, FilterX, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/primitives/card";
import { Input } from "@/components/primitives/input";
import { Button } from "@/components/primitives/button";
import { Badge } from "@/components/primitives/badge";
import { MultiSelect } from "@/components/primitives/multi-select";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/primitives/collapsible";
import { SourceToggle } from "@/components/shared/SourceToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/primitives/sheet";
import { cn } from "@/lib/utils";
import {
  AVAILABLE_SPEED_TYPES,
  AVAILABLE_ALIGNMENTS,
  FilterValues,
  DEFAULT_FILTERS,
} from "@/lib/types/monsters";

interface MonsterFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableTypes?: string[];
  availableSpeedTypes?: readonly string[];
  availableSources?: string[];
  loading?: boolean;
}

export function MonsterFilters({
  filters,
  onFiltersChange,
  availableTypes = [],
  availableSpeedTypes = AVAILABLE_SPEED_TYPES,
  loading = false,
}: MonsterFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Local state for filter values (not applied until search is clicked)
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

  // Local state for input text values (to avoid losing focus on keystroke)
  const [minLevelInput, setMinLevelInput] = useState(
    String(filters.challengeLevelRange[0]),
  );
  const [maxLevelInput, setMaxLevelInput] = useState(
    String(filters.challengeLevelRange[1]),
  );

  // Sync local filters when external filters change (e.g., from URL or clear)
  useEffect(() => {
    setLocalFilters(filters);
    setMinLevelInput(String(filters.challengeLevelRange[0]));
    setMaxLevelInput(String(filters.challengeLevelRange[1]));
  }, [filters]);

  const handleLocalFilterChange = (key: keyof FilterValues, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value,
    });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setMobileSheetOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.challengeLevelRange[0] !== 1 ||
    filters.challengeLevelRange[1] !== 30 ||
    filters.types.length > 0 ||
    filters.speedType.length > 0 ||
    filters.alignment.length > 0 ||
    filters.monsterSource !== "all";

  const activeFilterCount = [
    filters.search !== "",
    filters.challengeLevelRange[0] !== 1 ||
      filters.challengeLevelRange[1] !== 30,
    filters.types.length > 0,
    filters.speedType.length > 0,
    filters.alignment.length > 0,
    filters.monsterSource !== "all",
  ].filter(Boolean).length;

  // Reusable filter content component - memoized to prevent input focus loss
  const FilterContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        {/* Challenge Level Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Challenge Level Range</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Min Level</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="1"
                value={minLevelInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty or numeric values
                  if (value === "" || /^\d+$/.test(value)) {
                    setMinLevelInput(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur(); // Trigger validation
                    applyFilters();
                  }
                }}
                onBlur={() => {
                  const min = parseInt(minLevelInput);
                  if (minLevelInput === "" || isNaN(min)) {
                    setMinLevelInput("1");
                    handleLocalFilterChange("challengeLevelRange", [
                      1,
                      localFilters.challengeLevelRange[1],
                    ]);
                  } else {
                    const clampedMin = Math.max(1, Math.min(100, min));
                    setMinLevelInput(String(clampedMin));
                    handleLocalFilterChange("challengeLevelRange", [
                      Math.min(clampedMin, localFilters.challengeLevelRange[1]),
                      localFilters.challengeLevelRange[1],
                    ]);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Max Level</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="30"
                value={maxLevelInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty or numeric values
                  if (value === "" || /^\d+$/.test(value)) {
                    setMaxLevelInput(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur(); // Trigger validation
                    applyFilters();
                  }
                }}
                onBlur={() => {
                  const max = parseInt(maxLevelInput);
                  if (maxLevelInput === "" || isNaN(max)) {
                    setMaxLevelInput("30");
                    handleLocalFilterChange("challengeLevelRange", [
                      localFilters.challengeLevelRange[0],
                      30,
                    ]);
                  } else {
                    const clampedMax = Math.max(1, Math.min(100, max));
                    setMaxLevelInput(String(clampedMax));
                    handleLocalFilterChange("challengeLevelRange", [
                      localFilters.challengeLevelRange[0],
                      Math.max(clampedMax, localFilters.challengeLevelRange[0]),
                    ]);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Monster Types */}
          <MultiSelect
            label="Monster Types"
            placeholder="Select types"
            options={availableTypes.map((type) => ({
              value: type,
              label: type,
            }))}
            selected={localFilters.types}
            onChange={(value) => handleLocalFilterChange("types", value)}
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
            selected={localFilters.speedType}
            onChange={(value) => handleLocalFilterChange("speedType", value)}
            searchable
            clearable
            disabled={loading}
          />

          {/* Alignment */}
          <MultiSelect
            label="Alignment"
            placeholder="Select alignments"
            options={AVAILABLE_ALIGNMENTS.map((align) => ({
              value: align.value,
              label: align.label,
            }))}
            selected={localFilters.alignment}
            onChange={(value) => handleLocalFilterChange("alignment", value)}
            clearable
            disabled={loading}
          />
        </div>

        {/* Filter Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={!hasActiveFilters || loading}
          >
            Clear All
          </Button>
          <Button size="sm" onClick={applyFilters} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    ),
    [
      localFilters,
      minLevelInput,
      maxLevelInput,
      availableTypes,
      availableSpeedTypes,
      loading,
      hasActiveFilters,
    ],
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Monster Source Filter */}
          <SourceToggle
            value={localFilters.monsterSource}
            onChange={(value) => {
              handleLocalFilterChange("monsterSource", value);
              // Apply immediately for source toggle
              onFiltersChange({
                ...localFilters,
                monsterSource: value,
              });
            }}
            labels={{
              all: "All Monsters",
              official: "Core Monsters",
              custom: "User Created",
            }}
            disabled={loading}
          />

          {/* Search and Filter Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search monsters by name or description..."
                value={localFilters.search}
                onChange={(e) =>
                  handleLocalFilterChange("search", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <Button onClick={applyFilters} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {/* Mobile Filter Button - Opens Sheet */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant={activeFilterCount > 0 ? "default" : "outline"}
                  className="md:hidden"
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] px-4 pb-8 sm:px-6"
              >
                <SheetHeader className="pb-4">
                  <SheetTitle>Filter Monsters</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(90vh-80px)] px-1">
                  {FilterContent}
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filter Button - Toggles Collapsible */}
            <Button
              variant={expanded ? "default" : "outline"}
              onClick={() => setExpanded(!expanded)}
              className="hidden md:flex"
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
                aria-label="Clear all filters"
              >
                <FilterX className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          {/* Desktop Advanced Filters - Collapsible */}
          <Collapsible
            open={expanded}
            onOpenChange={setExpanded}
            className="hidden md:block"
          >
            <CollapsibleContent>
              <div className="pt-4 border-t">{FilterContent}</div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
