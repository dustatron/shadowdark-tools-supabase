"use client";

import { Filter, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SourceToggle } from "@/src/components/ui/SourceToggle";
import { SearchInput } from "@/src/components/ui/SearchInput";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AVAILABLE_SPEED_TYPES,
  FilterValues,
  DEFAULT_FILTERS,
} from "@/lib/types/monsters";

interface MonsterFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableTypes?: string[];
  availableSpeedTypes?: string[];
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

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
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

  // Reusable filter content component
  const FilterContent = () => (
    <div className="flex flex-col gap-4">
      {/* Challenge Level Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Challenge Level Range</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Min Level</label>
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
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Max Level</label>
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
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Monster Source Filter */}
          <SourceToggle
            value={filters.monsterSource}
            onChange={(value) => handleFilterChange("monsterSource", value)}
            labels={{
              all: "All Monsters",
              official: "Core Monsters",
              custom: "User Created",
            }}
            disabled={loading}
          />

          {/* Search and Filter Button */}
          <div className="flex gap-2">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange("search", value)}
              placeholder="Search monsters by name or description..."
              disabled={loading}
              debounceMs={500}
            />

            <div className="flex gap-2">
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
                    <FilterContent />
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
                >
                  <FilterX className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Advanced Filters - Collapsible */}
          <Collapsible
            open={expanded}
            onOpenChange={setExpanded}
            className="hidden md:block"
          >
            <CollapsibleContent>
              <div className="pt-4 border-t">
                <FilterContent />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
