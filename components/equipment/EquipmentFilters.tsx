"use client";

import { Search, Filter, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Card, CardContent } from "@/components/primitives/card";
import { Input } from "@/components/primitives/input";
import { Button } from "@/components/primitives/button";
import { MultiSelect } from "@/components/primitives/multi-select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/primitives/collapsible";
import {
  AVAILABLE_ITEM_TYPES,
  FilterValues,
  DEFAULT_FILTERS,
} from "@/lib/types/equipment";

interface EquipmentFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  loading?: boolean;
}

export function EquipmentFilters({
  filters,
  onFiltersChange,
  loading = false,
}: EquipmentFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  const [debouncedSearch] = useDebounce(localSearch, 500);

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

  const hasActiveFilters = filters.search !== "" || filters.itemType.length > 0;

  const activeFilterCount = [
    filters.search !== "",
    filters.itemType.length > 0,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col gap-4">
          {/* Search Input - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment by name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>

          {/* Filter Buttons - Right Aligned */}
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
                <FilterX className="h-4 w-4" />
              </Button>
            )}

            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant={expanded ? "default" : "outline"}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="text-xs">({activeFilterCount})</span>
                  )}
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Collapsible Filters */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleContent>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MultiSelect
                  label="Item Types"
                  placeholder="Select item types"
                  options={AVAILABLE_ITEM_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  selected={filters.itemType}
                  onChange={(value) => handleFilterChange("itemType", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
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
