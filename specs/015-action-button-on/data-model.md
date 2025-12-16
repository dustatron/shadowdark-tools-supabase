# Data Model: Action Menu Button Component

**Phase**: 1 - Design & Contracts
**Date**: 2025-12-16

## Component Props Models

### EntityActionMenu Component

```typescript
interface EntityActionMenuProps<T extends { id: string }> {
  // Core entity data
  entity: T;
  entityType: "monster" | "spell";

  // State flags
  isFavorited: boolean;
  isOwner: boolean;

  // Action callbacks
  onFavoriteToggle: () => Promise<void>;
  onAddToList: () => void;
  onEdit?: () => void; // Optional - only when isOwner=true

  // Configuration
  config?: ActionMenuConfig;
}

interface ActionMenuConfig {
  showDeck?: boolean; // default false for monsters, true for spells
  deckTooltip?: string; // default "Deck support for monsters coming soon"
  deckEnabled?: boolean; // default false, can be true for supported entities
}
```

**Validation Rules**:

- `entity.id` must be valid UUID (Zod schema: `z.string().uuid()`)
- `entityType` must be one of allowed types
- `onFavoriteToggle` must be async function
- If `isOwner=true`, `onEdit` should be provided

**State Transitions**:

```
Menu Closed → User clicks button → Menu Open
Menu Open → User selects action → Action executing → Menu Closed
Menu Open → User clicks outside → Menu Closed
Menu Open → User presses ESC → Menu Closed
```

### ListSelectorModal Component

```typescript
interface ListSelectorModalProps {
  // Control
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Entity to add
  entityId: string;
  entityType: "monster" | "spell";

  // Data
  lists: UserList[];
  existingListIds: string[]; // Lists that already contain this entity

  // Actions
  onSelectList: (listId: string) => Promise<void>;
  onCreateList: (name: string) => Promise<string>; // Returns new list ID
}

interface UserList {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
  created_at: string;
  user_id: string;
}
```

**Validation Rules**:

- `entityId` must be valid UUID
- `lists` array can be empty (new user with no lists)
- `existingListIds` must be subset of `lists.map(l => l.id)`
- List name in create form: min 1 char, max 100 chars (Zod: `z.string().min(1).max(100)`)

**State Transitions**:

```
Closed → onOpenChange(true) → Open (Loading lists)
Open (Loading) → Lists fetched → Open (Ready)
Open (Ready) → User selects list → Adding to list → Success → Closed
Open (Ready) → User creates list → Creating → Adding to new list → Success → Closed
Open → User clicks X or outside → Closed
Open → Error occurs → Open (showing error message)
```

## Database Models (Existing - No Changes Needed)

### user_favorites Table

```sql
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('monster', 'spell')),
  entity_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_user_favorites_user_entity ON user_favorites(user_id, entity_type, entity_id);
```

**RLS Policies** (existing):

- Users can read their own favorites
- Users can insert their own favorites
- Users can delete their own favorites

### user_lists Table

```sql
CREATE TABLE user_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_lists_user_id ON user_lists(user_id);
```

**RLS Policies** (existing):

- Users can read their own lists
- Users can create their own lists
- Users can update their own lists
- Users can delete their own lists

### list_items Table

```sql
CREATE TABLE list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('monster', 'spell')),
  entity_id uuid NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, entity_id) -- Prevents duplicates
);

CREATE INDEX idx_list_items_list_id ON list_items(list_id);
CREATE INDEX idx_list_items_entity ON list_items(entity_type, entity_id);
```

**RLS Policies** (existing):

- Users can read list_items for their own lists (via join)
- Users can insert list_items into their own lists
- Users can update list_items in their own lists
- Users can delete list_items from their own lists

## Zod Validation Schemas

### List Creation Schema

```typescript
export const CreateListSchema = z.object({
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
});

export type CreateListInput = z.infer<typeof CreateListSchema>;
```

### Add to List Schema

```typescript
export const AddToListSchema = z.object({
  listId: z.string().uuid("Invalid list ID"),
  entityId: z.string().uuid("Invalid entity ID"),
  entityType: z.enum(["monster", "spell"]),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().max(500).optional().nullable(),
});

export type AddToListInput = z.infer<typeof AddToListSchema>;
```

## React Query Keys

```typescript
export const queryKeys = {
  // Favorites
  favorites: (userId: string, entityType: string) =>
    ["favorites", userId, entityType] as const,

  isFavorited: (userId: string, entityType: string, entityId: string) =>
    ["favorites", userId, entityType, entityId] as const,

  // Lists
  userLists: (userId: string) => ["lists", userId] as const,

  listItems: (listId: string) => ["list-items", listId] as const,

  listContainsEntity: (listId: string, entityId: string) =>
    ["list-contains", listId, entityId] as const,
};
```

## Component State Flow

### Favorite Toggle Flow

```
1. User clicks favorite action in menu
2. Component calls onFavoriteToggle()
3. Mutation hook:
   a. onMutate: Optimistically update isFavorited state
   b. Execute API call (POST or DELETE /api/favorites)
   c. onSuccess: Invalidate queries, show success toast, close menu
   d. onError: Rollback optimistic update, show error toast
```

### Add to List Flow

```
1. User clicks "Add to Adventure List" in menu
2. Component opens ListSelectorModal
3. Modal fetches user's lists (React Query)
4. Modal fetches existing list items to mark already-added lists
5. User selects existing list OR creates new list:

   Option A (Existing List):
   a. User clicks list radio button
   b. Clicks "Add to List" button
   c. onSelectList(listId) called
   d. Mutation: POST /api/lists/{listId}/items
   e. Success: Close modal, show toast, invalidate list queries

   Option B (New List):
   a. User types list name in form
   b. Clicks "Create & Add" button
   c. onCreateList(name) called
   d. Mutation 1: POST /api/lists (create list)
   e. Mutation 2: POST /api/lists/{newListId}/items (add entity)
   f. Success: Close modal, show toast, invalidate list queries
```

## Error States

### Favorite Toggle Errors

- **Network error**: Show toast "Failed to update favorite. Please try again."
- **Auth error**: Show toast "Please sign in to favorite items."
- **RLS policy violation**: Show toast "You don't have permission to do that."

### Add to List Errors

- **Duplicate item**: Show checkmark + "Already in list" message (not error, just disabled)
- **Network error**: Keep modal open, show toast "Failed to add to list. Please try again."
- **List name validation error**: Show inline error under input
- **Auth error**: Close modal, show toast "Please sign in to manage lists."

## Performance Considerations

### Optimistic Updates

- Favorite toggle: Update local cache immediately (< 50ms perceived latency)
- Rollback on error with automatic retry option

### Query Caching

- User lists cached for 5 minutes (stale time)
- Favorite state cached indefinitely until invalidated
- Background revalidation on window focus

### Modal Loading

- Prefetch user lists when action menu opens (preload)
- Show skeleton loaders in modal during fetch
- Cache list data to avoid refetch on reopen

## Relationships

```
User (auth.users)
  ├─> user_favorites (1:many) - favorite monsters/spells
  └─> user_lists (1:many) - custom lists
        └─> list_items (1:many) - entities in list
              └─> References: official_monsters | user_monsters | official_spells | user_spells
```

## Migration Requirements

**No database migrations needed** - all tables and RLS policies already exist in production.

**Validation**:

- Verify `user_favorites` has correct indexes
- Verify `list_items` has UNIQUE constraint on (list_id, entity_id)
- Test RLS policies in development environment
