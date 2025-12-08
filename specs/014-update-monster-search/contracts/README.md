# API Contracts: Monster Search View Toggle

**Feature**: 014-update-monster-search

## No New API Endpoints

This feature does not require any new API endpoints. The view toggle is purely a frontend UI concern.

## Existing API Usage

The existing `/api/monsters` endpoint continues to work unchanged:

```
GET /api/monsters?q=dragon&min_cl=5&max_cl=15&view=table
```

Note: The `view` parameter is consumed by the frontend only and ignored by the API.

## Component Contracts

### ViewToggle Component

**Props**:

```typescript
interface ViewToggleProps {
  value: "cards" | "table";
  onChange: (value: "cards" | "table") => void;
  disabled?: boolean;
}
```

**Behavior**:

- Renders two toggle buttons (Cards, Table)
- Highlights active view
- Calls onChange on click

### MonsterTable Component

**Props**:

```typescript
interface MonsterTableProps {
  monsters: Monster[];
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  preserveSearchParams?: boolean;
}
```

**Behavior**:

- Renders monsters in table format
- Clickable rows navigate to monster detail
- Sort indicators on sortable columns
- Favorite button in first column
