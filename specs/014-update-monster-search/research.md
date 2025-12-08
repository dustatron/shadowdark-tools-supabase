# Research: Monster Search View Toggle

**Feature**: 014-update-monster-search
**Date**: 2025-12-08

## Technical Decisions

### View Toggle Persistence Strategy

**Decision**: URL parameter (`view=table|cards`) with localStorage fallback

**Rationale**:

- URL params enable shareable links with view preference
- localStorage preserves preference when navigating without explicit param
- Aligns with existing filter persistence pattern in `serializeFiltersToSearchParams`

**Alternatives Considered**:

- User profile (rejected: requires auth, DB migration, overkill for display preference)
- Session only (rejected: loses preference on navigation)
- localStorage only (rejected: not shareable)

### Table Implementation Approach

**Decision**: @tanstack/react-table with shadcn/ui DataTable pattern

**Rationale**:

- shadcn/ui recommends TanStack Table for sortable data tables
- Already have basic Table components in components/ui/table.tsx
- TanStack Table provides sorting, filtering hooks out of box
- Works well with existing pagination pattern

**Alternatives Considered**:

- Manual sorting with native table (rejected: reinventing wheel, harder to maintain)
- ag-grid (rejected: overkill, large bundle size)

### Mobile Handling

**Decision**: Horizontal scroll for table on mobile, hide secondary columns

**Rationale**:

- Table already has `overflow-x-auto` container
- Hide Speed, Source columns on mobile (Name, CL, HP, AC are primary)
- Matches existing table patterns in codebase

## Existing Codebase Patterns

### Current Monster List Flow

```
MonstersClient.tsx
├── Manages filter state, pagination
├── Fetches from /api/monsters
├── Renders MonsterFilters + MonsterList
└── Updates URL on filter change

MonsterList.tsx
├── Renders grid of MonsterCard components
├── Handles loading, error, empty states
├── Pagination component at bottom

MonsterCard.tsx
├── Individual monster display
├── Expandable details
├── Favorite button, edit link
```

### URL Parameter Pattern

Existing params in `lib/types/monsters.ts`:

- `q` - search query
- `min_cl`, `max_cl` - challenge level range
- `types` - monster types (comma-separated)
- `speed` - speed types (comma-separated)
- `type` - monster source (official|custom)
- `page`, `limit` - pagination

**New param**: `view=table|cards` (default: cards)

### Component Structure

```
src/components/monsters/
├── MonsterCard.tsx      # Existing card view
├── MonsterFilters.tsx   # Existing filters (add view toggle here)
├── MonsterList.tsx      # Existing list wrapper (switch between views)
└── MonsterTable.tsx     # NEW: table view component
```

## Dependencies Required

- `@tanstack/react-table@8.x` - Sorting and table state management
- No other new dependencies needed

## Files to Modify

1. **lib/types/monsters.ts** - Add `view` to FilterValues, update serialization
2. **src/components/monsters/MonsterFilters.tsx** - Add view toggle button group
3. **src/components/monsters/MonsterList.tsx** - Conditional render card vs table
4. **app/monsters/MonstersClient.tsx** - Handle view state from URL
5. **app/monsters/page.tsx** - Parse view param

## Files to Create

1. **src/components/monsters/MonsterTable.tsx** - New table view component
2. **components/ui/data-table.tsx** - shadcn DataTable wrapper (optional)

## Clarifications Resolved

| Open Question    | Decision                                      |
| ---------------- | --------------------------------------------- |
| View persistence | URL param + localStorage fallback             |
| Mobile table     | Horizontal scroll, hide non-essential columns |
