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
    filters.traitTypes.length > 0 ||
    filters.search !== "" ||
    filters.itemSource !== "all";

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Item Source Filter */}
        <SourceToggle
          value={filters.itemSource}
          onChange={(value) => handleFilterChange("itemSource", value)}
          labels={{
            all: "All Items",
            official: "Core Items",
            custom: "Custom Items",
          }}
          disabled={loading}
        />

        <div className="space-y-4">
          {/* Search Input */}
          <SearchInput
            value={filters.search}
            onChange={(value) => handleFilterChange("search", value)}
            placeholder="Search magic items by name or description..."
            disabled={loading}
            debounceMs={300}
          />

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
