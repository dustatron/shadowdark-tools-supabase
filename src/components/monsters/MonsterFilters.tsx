"use client";

import {
  Card,
  Stack,
  TextInput,
  MultiSelect,
  RangeSlider,
  Button,
  Group,
  Text,
  Collapse,
  ActionIcon,
  Grid,
  Select,
  SegmentedControl,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconFilterOff,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useDebouncedValue } from "@mantine/hooks";

interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  locations: string[];
  sources: string[];
  monsterSource: "all" | "official" | "custom";
}

interface MonsterFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableTypes?: string[];
  availableLocations?: string[];
  availableSources?: string[];
  loading?: boolean;
}

const DEFAULT_FILTERS: FilterValues = {
  search: "",
  challengeLevelRange: [1, 20],
  types: [],
  locations: [],
  sources: [],
  monsterSource: "all",
};

export function MonsterFilters({
  filters,
  onFiltersChange,
  availableTypes = [],
  availableLocations = [],
  availableSources = [],
  loading = false,
}: MonsterFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  const [debouncedSearch] = useDebouncedValue(localSearch, 300);

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
    filters.locations.length > 0 ||
    filters.sources.length > 0 ||
    filters.monsterSource !== "all";

  const activeFilterCount = [
    filters.search !== "",
    filters.challengeLevelRange[0] !== 1 ||
      filters.challengeLevelRange[1] !== 20,
    filters.types.length > 0,
    filters.locations.length > 0,
    filters.sources.length > 0,
    filters.monsterSource !== "all",
  ].filter(Boolean).length;

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Monster Source Filter */}
        <SegmentedControl
          value={filters.monsterSource}
          onChange={(value) =>
            handleFilterChange(
              "monsterSource",
              value as "all" | "official" | "custom",
            )
          }
          data={[
            { label: "All Monsters", value: "all" },
            { label: "Core Monsters", value: "official" },
            { label: "User Created", value: "custom" },
          ]}
          fullWidth
          disabled={loading}
        />

        {/* Search and Quick Filters */}
        <Group>
          <TextInput
            placeholder="Search monsters by name or description..."
            leftSection={<IconSearch size={16} />}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ flex: 1 }}
            disabled={loading}
          />

          <Group gap="xs">
            <Button
              variant={expanded ? "filled" : "light"}
              leftSection={<IconFilter size={16} />}
              rightSection={
                expanded ? (
                  <IconChevronUp size={14} />
                ) : (
                  <IconChevronDown size={14} />
                )
              }
              onClick={() => setExpanded(!expanded)}
            >
              Filters
              {activeFilterCount > 0 && (
                <Text size="xs" ml={4}>
                  ({activeFilterCount})
                </Text>
              )}
            </Button>

            {hasActiveFilters && (
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={clearFilters}
                title="Clear all filters"
              >
                <IconFilterOff size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Stack gap="md">
            <Grid>
              {/* Challenge Level Range */}
              <Grid.Col span={12}>
                <Text size="sm" fw={500} mb="xs">
                  Challenge Level: {filters.challengeLevelRange[0]} -{" "}
                  {filters.challengeLevelRange[1]}
                </Text>
                <RangeSlider
                  min={1}
                  max={20}
                  step={1}
                  value={filters.challengeLevelRange}
                  onChange={(value) =>
                    handleFilterChange("challengeLevelRange", value)
                  }
                  marks={[
                    { value: 1, label: "1" },
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                    { value: 15, label: "15" },
                    { value: 20, label: "20" },
                  ]}
                  disabled={loading}
                />
              </Grid.Col>

              {/* Monster Types */}
              <Grid.Col span={6}>
                <MultiSelect
                  label="Monster Types"
                  placeholder="Select types"
                  data={availableTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  value={filters.types}
                  onChange={(value) => handleFilterChange("types", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>

              {/* Locations */}
              <Grid.Col span={6}>
                <MultiSelect
                  label="Locations"
                  placeholder="Select locations"
                  data={availableLocations.map((loc) => ({
                    value: loc,
                    label: loc,
                  }))}
                  value={filters.locations}
                  onChange={(value) => handleFilterChange("locations", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>

              {/* Sources */}
              <Grid.Col span={12}>
                <MultiSelect
                  label="Sources"
                  placeholder="Select sources"
                  data={availableSources.map((source) => ({
                    value: source,
                    label: source,
                  }))}
                  value={filters.sources}
                  onChange={(value) => handleFilterChange("sources", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>
            </Grid>

            {/* Filter Actions */}
            <Group justify="flex-end">
              <Button
                variant="subtle"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters || loading}
              >
                Clear All
              </Button>
            </Group>
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}
