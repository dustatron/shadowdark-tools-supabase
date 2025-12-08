# Data Model: Monster Search View Toggle

**Feature**: 014-update-monster-search
**Date**: 2025-12-08

## No Database Changes Required

This feature is purely a UI presentation layer change. No new database tables, columns, or migrations needed.

## Type Changes

### FilterValues Extension

**File**: `lib/types/monsters.ts`

```typescript
// Add view type
export type ViewMode = "cards" | "table";

// Extend FilterValues (or create separate ViewState)
export interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  speedType: string[];
  monsterSource: "all" | "official" | "custom";
  view: ViewMode; // NEW
}

// Update DEFAULT_FILTERS
export const DEFAULT_FILTERS: FilterValues = {
  search: "",
  challengeLevelRange: [1, 20],
  types: [],
  speedType: [],
  monsterSource: "all",
  view: "cards", // NEW - default to cards
};
```

### URL Serialization Updates

```typescript
// Add to parseFiltersFromSearchParams
const viewParam = get("view");
const view: ViewMode = viewParam === "table" ? "table" : "cards";

// Add to serializeFiltersToSearchParams
if (filters.view === "table") {
  params.set("view", "table");
}
```

## Component Props Updates

### MonsterList Props

```typescript
interface MonsterListProps {
  // ... existing props
  view: ViewMode; // NEW - which view to render
}
```

### MonsterFilters Props

```typescript
interface MonsterFiltersProps {
  // ... existing props
  view: ViewMode; // NEW - current view state
  onViewChange: (view: ViewMode) => void; // NEW - view toggle handler
}
```

## State Flow

```
URL (?view=table)
    ↓
page.tsx (parseFiltersFromSearchParams)
    ↓
MonstersClient (filters.view state)
    ↓
├── MonsterFilters (displays toggle, calls onViewChange)
└── MonsterList (renders MonsterTable or MonsterCard grid based on view)
```

## Monster Table Column Definition

| Column   | Key             | Sortable | Mobile Visible |
| -------- | --------------- | -------- | -------------- |
| Favorite | -               | No       | Yes            |
| Name     | name            | Yes      | Yes            |
| CL       | challenge_level | Yes      | Yes            |
| HP       | hit_points      | Yes      | Yes            |
| AC       | armor_class     | Yes      | Yes            |
| Speed    | speed           | No       | No             |
| Source   | source          | No       | No             |
