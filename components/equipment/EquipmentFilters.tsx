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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
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

  const FilterContent = () => (
    <div className="flex flex-col gap-4">
      {/* Item Types */}
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
          {/* Search and Filter Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment by name..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9"
              />
            </div>

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
                    <SheetTitle>Filter Equipment</SheetTitle>
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
