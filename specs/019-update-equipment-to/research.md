# Research: User Equipment CRUD

**Feature**: 019-update-equipment-to
**Date**: 2025-01-05

## Existing Patterns Analysis

### Database Pattern (from user_magic_items)

**Decision**: Follow user_magic_items table pattern exactly

**Rationale**:

- Proven pattern with RLS policies for user-owned content
- Supports public/private visibility toggle
- Slug-based URLs with uniqueness per user
- Updated_at trigger for timestamps
- JSONB for complex nested data (cost, properties)

**Key elements to replicate**:

1. `user_equipment` table with `user_id` FK to `user_profiles`
2. Cascade delete on `user_id` (user deleted → equipment deleted)
3. RLS policies: owner read/write, public read for is_public=true, admin full access
4. Trigram index for fuzzy search on name
5. Full-text search index on name + description (if adding description)

### API Route Pattern (from /api/user/magic-items)

**Decision**: Identical structure to user/magic-items routes

**Rationale**:

- Consistent API surface across all user-created content types
- Same auth patterns (getUser, check ownership, admin bypass)
- Same Zod validation at API boundaries
- Same slug generation for URL-friendly access

**Routes needed**:

- `GET /api/user/equipment` - List user's equipment
- `POST /api/user/equipment` - Create equipment
- `GET /api/user/equipment/[id]` - Get specific item
- `PUT /api/user/equipment/[id]` - Update item
- `DELETE /api/user/equipment/[id]` - Delete item

### TanStack Query Pattern

**Decision**: Use useMutation with fetch calls (NOT direct Supabase client)

**Rationale**:

- Existing codebase uses fetch-based mutations to API routes
- API routes handle auth, validation, and slug generation
- Query invalidation pattern: `queryClient.invalidateQueries({ queryKey: ["equipment"] })`
- Toast notifications via sonner on success/error

**Pattern from DeckForm.tsx**:

```typescript
const createMutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch("/api/user/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create");
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["equipment"] });
    toast.success("Equipment created");
  },
});
```

### Form Pattern (from MagicItemForm)

**Decision**: Separate EquipmentForm component with react-hook-form + Zod

**Rationale**:

- Consistent UX with magic items, spells, monsters
- Mode prop for create/edit
- initialData for edit mode
- Delete button with confirmation dialog on edit page
- Direct fetch calls within form (not using hooks for simplicity)

### Cascade Delete for Adventure Lists

**Decision**: Database-level cascade delete via trigger

**Rationale**:

- adventure_list_items table uses item_type='equipment' + item_id reference
- Need trigger to delete adventure_list_items when user_equipment is deleted
- Cannot use FK constraint since item_id references multiple tables

**Implementation approach**:

```sql
CREATE OR REPLACE FUNCTION delete_adventure_list_items_on_user_equipment_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM adventure_list_items
  WHERE item_id = OLD.id AND item_type = 'user_equipment';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_delete_user_equipment_from_lists
BEFORE DELETE ON user_equipment
FOR EACH ROW EXECUTE FUNCTION delete_adventure_list_items_on_user_equipment_delete();
```

### View Pattern (all_equipment)

**Decision**: Create all_equipment view combining official + public user equipment

**Rationale**:

- Matches all_magic_items, all_monsters, all_spells pattern
- Enables unified search across official and community content
- Includes item_type discriminator ('official' vs 'custom')
- Includes creator_name for attribution

## Equipment-Specific Considerations

### Fields from Official Equipment

From `equipment` table schema:

- name (TEXT, required)
- item_type (TEXT: armor/weapon/gear)
- cost (JSONB: {amount, currency})
- attack_type (TEXT, optional)
- range (TEXT, optional)
- damage (TEXT, optional)
- armor (TEXT, optional)
- properties (TEXT[], optional)
- slot (INTEGER, default 1)
- quantity (TEXT, optional)

### Additional Fields for User Equipment

- user_id (UUID, FK to user_profiles)
- slug (TEXT, unique per user)
- is_public (BOOLEAN, default false)
- description (TEXT, optional - for user context)
- created_at, updated_at (TIMESTAMPTZ)

## Alternatives Considered

### Direct Supabase Client in Components

**Rejected because**: API routes provide centralized validation, auth checks, and slug generation. Consistency with existing patterns more important than slight performance gain.

### Shared Form Component with Magic Items

**Rejected because**: Equipment has different fields (cost, properties, damage) than magic items (traits). Separate form component is cleaner.

### Soft Delete

**Rejected because**: Not used elsewhere in codebase. Hard delete with cascade is sufficient for MVP.
