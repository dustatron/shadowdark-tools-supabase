# Research: Action Menu Button Component

**Phase**: 0 - Outline & Research
**Date**: 2025-12-16

## Research Questions

### 1. shadcn/ui DropdownMenu Best Practices

**Decision**: Use `DropdownMenu` component from shadcn/ui with Radix UI primitives

**Rationale**:

- Already integrated in project (shadcn/ui is primary component library)
- Built on Radix UI's `DropdownMenu` primitive - accessible by default (ARIA, keyboard nav)
- Provides `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`
- Native support for disabled items with tooltips via `DropdownMenuLabel`
- Automatic focus management and click-outside-to-close behavior
- Mobile-friendly with touch event handling

**Alternatives Considered**:

- Custom Popover implementation - rejected (over-engineering, accessibility concerns)
- headlessui Menu component - rejected (not part of existing tech stack)
- Native HTML `<select>` - rejected (not suitable for action menu UX)

**Implementation Notes**:

- Use `DropdownMenuCheckboxItem` for favorite toggle with checked state
- Disabled items via `disabled` prop + `Tooltip` wrapper for "coming soon" message
- Icons from Lucide React (Heart, HeartOff, List, Layers, Edit)

### 2. Modal Component for List Selector

**Decision**: Use shadcn/ui `Dialog` component with custom list selection logic

**Rationale**:

- Consistent with project's component library
- Accessible modal with focus trap, ESC to close, backdrop click to close
- `DialogHeader`, `DialogTitle`, `DialogDescription` for semantic structure
- `DialogContent` for custom form/list UI
- Already has examples in codebase for forms/dialogs

**Alternatives Considered**:

- Inline dropdown list selector - rejected (poor UX for many lists, no create option)
- Sheet component (drawer) - rejected (modal is more appropriate for form-like interaction)
- Custom modal implementation - rejected (accessibility/focus management complexity)

**Implementation Notes**:

- Trigger dialog from "Add to Adventure List" menu action
- Dialog contains scrollable list of existing user lists + "Create New List" form
- Use RadioGroup for single list selection
- Inline form for new list creation (input + create button)
- Close dialog on successful add with toast notification

### 3. Favorite State Management

**Decision**: Server state with optimistic UI updates using React Query (@tanstack/react-query)

**Rationale**:

- Already in project dependencies for server state management
- Optimistic updates provide instant feedback (<50ms perceived)
- Automatic rollback on failure with error notification
- Cache invalidation ensures consistency across components
- Integrates with Supabase client for mutations

**Alternatives Considered**:

- Client-only state (useState) - rejected (no persistence, stale data)
- Zustand global state - rejected (server state should use React Query per project patterns)
- SWR - rejected (React Query already in use)

**Implementation Notes**:

- `useMutation` for favorite toggle with `onMutate` for optimistic update
- `queryClient.setQueryData` to immediately update cached favorite state
- `onError` callback to rollback optimistic update and show toast
- `onSuccess` to show success toast and revalidate related queries

### 4. Reusable Component API Design

**Decision**: Generic `EntityActionMenu` component with type parameter and config object

**Rationale**:

- Single component can serve monsters, spells, other future entity types
- TypeScript generics ensure type safety for entity-specific props
- Config object allows entity-specific action visibility/behavior
- Composition pattern aligns with React best practices

**Component API**:

```typescript
interface EntityActionMenuProps<T> {
  entity: T;
  entityType: "monster" | "spell";
  isFavorited: boolean;
  isOwner: boolean;
  onFavoriteToggle: () => Promise<void>;
  onAddToList: () => void;
  onEdit?: () => void;
  config?: {
    showDeck?: boolean; // default false for monsters, true for spells
    deckTooltip?: string;
  };
}
```

**Alternatives Considered**:

- Separate `MonsterActionMenu` and `SpellActionMenu` - rejected (code duplication)
- Render prop pattern - rejected (unnecessary complexity for this use case)
- HOC pattern - rejected (composition is clearer and more modern)

### 5. List Duplication Prevention

**Decision**: Database constraint + client-side validation

**Rationale**:

- RLS policies already enforce user ownership
- Unique constraint on `(list_id, monster_id)` in `list_items` table prevents DB-level duplicates
- Client-side check before mutation provides better UX (no network round-trip for error)
- Error handling for constraint violations shows user-friendly message

**Implementation Notes**:

- Check existing list items in modal (query user's lists with item counts)
- Show checkmark/indicator for lists already containing the monster
- Disable "Add" button for lists that already have the item
- Allow selection to show "Already in list" message vs error

### 6. Authentication Gating

**Decision**: Server-side auth check with conditional rendering

**Rationale**:

- Next.js middleware already handles route-level auth
- Component receives user session from server component via props
- No component render if user is null (clean, no flash of content)
- Aligns with existing auth patterns in monster detail pages

**Implementation Notes**:

- Monster detail page (Server Component) calls `await createClient()` and `getUser()`
- Pass `userId` to client component
- Client component renders nothing if no `userId`
- Action menu only accessible to authenticated users per FR-002

## Technology Stack Summary

**UI Components**:

- shadcn/ui `DropdownMenu` (action menu)
- shadcn/ui `Dialog` (list selector modal)
- shadcn/ui `Button`, `Input`, `RadioGroup` (form elements)
- Lucide React icons (Heart, List, Layers, Edit, MoreVertical)

**State Management**:

- @tanstack/react-query for server state (favorites, lists)
- React useState for local UI state (modal open/closed)
- Optimistic updates for immediate feedback

**Validation**:

- Zod schemas for list creation form
- react-hook-form for form state management in modal

**Testing**:

- Vitest + @testing-library/react for component unit tests
- Playwright for E2E user workflows (favorite toggle, list selection)
- MSW (Mock Service Worker) for API mocking in tests

## Open Questions

None - all technical decisions resolved.

## Next Steps

Proceed to Phase 1: Design & Contracts

- Define data models for component props
- Specify API contracts (if any new endpoints needed)
- Generate contract tests
- Create quickstart.md for E2E validation
