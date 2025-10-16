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
  tierRange: [number, number];
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
    filters.tierRange[0] !== 1 ||
    filters.tierRange[1] !== 5 ||
    filters.classes.length > 0 ||
    filters.durations.length > 0 ||
    filters.ranges.length > 0 ||
    filters.sources.length > 0;

  const activeFilterCount = [
    filters.search !== "",
    filters.tierRange[0] !== 1 || filters.tierRange[1] !== 5,
    filters.classes.length > 0,
    filters.durations.length > 0,
    filters.ranges.length > 0,
    filters.sources.length > 0,
  ].filter(Boolean).length;

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group>
          <TextInput
            placeholder="Search spells by name or description..."
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

        <Collapse in={expanded}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={12}>
                <Text size="sm" fw={500} mb="xs">
                  Tier: {filters.tierRange[0]} - {filters.tierRange[1]}
                </Text>
                <RangeSlider
                  min={1}
                  max={5}
                  step={1}
                  value={filters.tierRange}
                  onChange={(value) => handleFilterChange("tierRange", value)}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" },
                  ]}
                  disabled={loading}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MultiSelect
                  label="Classes"
                  placeholder="Select classes"
                  data={availableClasses.map((c) => ({ value: c, label: c }))}
                  value={filters.classes}
                  onChange={(value) => handleFilterChange("classes", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MultiSelect
                  label="Durations"
                  placeholder="Select durations"
                  data={availableDurations.map((d) => ({ value: d, label: d }))}
                  value={filters.durations}
                  onChange={(value) => handleFilterChange("durations", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MultiSelect
                  label="Ranges"
                  placeholder="Select ranges"
                  data={availableRanges.map((r) => ({ value: r, label: r }))}
                  value={filters.ranges}
                  onChange={(value) => handleFilterChange("ranges", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MultiSelect
                  label="Sources"
                  placeholder="Select sources"
                  data={availableSources.map((s) => ({ value: s, label: s }))}
                  value={filters.sources}
                  onChange={(value) => handleFilterChange("sources", value)}
                  searchable
                  clearable
                  disabled={loading}
                />
              </Grid.Col>
            </Grid>

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
