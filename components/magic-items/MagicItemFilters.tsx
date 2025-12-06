"use client";

import { Search, Filter, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FilterValues {
  search: string;
  traitTypes: string[];
  itemSource: "all" | "official" | "custom";
}

interface MagicItemFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableTraitTypes?: string[];
  loading?: boolean;
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  traitTypes: [],
  itemSource: "all",
};

export function MagicItemFilters({
  filters,
  onFiltersChange,
  availableTraitTypes = ["Benefit", "Curse", "Bonus", "Personality"],
  loading = false,
}: MagicItemFiltersProps) {
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
    filters.traitTypes.length > 0 ||
    filters.search !== "" ||
    filters.itemSource !== "all";

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Item Source Filter */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={filters.itemSource === "all" ? "default" : "outline"}
            onClick={() => handleFilterChange("itemSource", "all")}
            disabled={loading}
            className="text-xs sm:text-sm"
          >
            All Items
          </Button>
          <Button
            variant={filters.itemSource === "official" ? "default" : "outline"}
            onClick={() => handleFilterChange("itemSource", "official")}
            disabled={loading}
            className="text-xs sm:text-sm"
          >
            Core Items
          </Button>
          <Button
            variant={filters.itemSource === "custom" ? "default" : "outline"}
            onClick={() => handleFilterChange("itemSource", "custom")}
            disabled={loading}
            className="text-xs sm:text-sm"
          >
            Custom Items
          </Button>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search magic items by name or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          {/* Collapsible Advanced Filters */}
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                  disabled={loading}
                >
                  <FilterX className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>

            <CollapsibleContent className="space-y-4 mt-4">
              {/* Trait Types Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trait Types</label>
                <MultiSelect
                  options={availableTraitTypes.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  selected={filters.traitTypes}
                  onChange={(values) =>
                    handleFilterChange("traitTypes", values)
                  }
                  placeholder="Filter by trait type..."
                  disabled={loading}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
