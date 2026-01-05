# Data Model: User Equipment CRUD

**Feature**: 019-update-equipment-to
**Date**: 2025-01-05

## Entities

### user_equipment

User-created equipment items with ownership and visibility controls.

| Field       | Type        | Constraints                                      | Description             |
| ----------- | ----------- | ------------------------------------------------ | ----------------------- |
| id          | UUID        | PK, DEFAULT gen_random_uuid()                    | Unique identifier       |
| user_id     | UUID        | FK → user_profiles(id), ON DELETE CASCADE        | Owner                   |
| name        | TEXT        | NOT NULL, CHECK LENGTH > 0                       | Display name            |
| slug        | TEXT        | NOT NULL, UNIQUE(user_id, slug)                  | URL-friendly identifier |
| description | TEXT        | NULL                                             | Optional user notes     |
| item_type   | TEXT        | NOT NULL                                         | armor/weapon/gear       |
| cost        | JSONB       | NOT NULL, DEFAULT '{"amount":0,"currency":"gp"}' | Price                   |
| attack_type | TEXT        | NULL                                             | Melee/Ranged (weapons)  |
| range       | TEXT        | NULL                                             | Range description       |
| damage      | TEXT        | NULL                                             | Damage dice/type        |
| armor       | TEXT        | NULL                                             | Armor value             |
| properties  | TEXT[]      | DEFAULT '{}'                                     | Property tags           |
| slot        | INTEGER     | NOT NULL, DEFAULT 1                              | Inventory slots         |
| quantity    | TEXT        | NULL                                             | Quantity description    |
| is_public   | BOOLEAN     | NOT NULL, DEFAULT false                          | Visibility              |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                          | Creation time           |
| updated_at  | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                          | Last update             |

### Indexes

```sql
-- User lookup
CREATE INDEX idx_user_equipment_user_id ON user_equipment(user_id);

-- URL routing
CREATE INDEX idx_user_equipment_slug ON user_equipment(user_id, slug);

-- Fuzzy name search
CREATE INDEX idx_user_equipment_name_trgm ON user_equipment USING GIN (name gin_trgm_ops);

-- Public items filter
CREATE INDEX idx_user_equipment_is_public ON user_equipment(is_public) WHERE is_public = true;

-- Full-text search
CREATE INDEX idx_user_equipment_search ON user_equipment USING GIN (
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);
```

### RLS Policies

```sql
-- SELECT: Own items + public items + admin
CREATE POLICY "user_equipment_select" ON user_equipment
FOR SELECT USING (
  user_id = auth.uid() OR
  is_public = true OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- INSERT: Own items only
CREATE POLICY "user_equipment_insert" ON user_equipment
FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: Own items + admin
CREATE POLICY "user_equipment_update" ON user_equipment
FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- DELETE: Own items + admin
CREATE POLICY "user_equipment_delete" ON user_equipment
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
```

### Cascade Delete Trigger

```sql
-- Delete adventure_list_items when user_equipment is deleted
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

## Views

### all_equipment

Combined view of official and public user equipment.

```sql
CREATE OR REPLACE VIEW all_equipment AS
SELECT
  id,
  name,
  NULL::TEXT as slug,
  NULL::TEXT as description,
  item_type,
  cost,
  attack_type,
  range,
  damage,
  armor,
  properties,
  slot,
  quantity,
  'official' as source_type,
  NULL::UUID as user_id,
  NULL::TEXT as creator_name,
  true as is_public,
  created_at,
  updated_at
FROM equipment

UNION ALL

SELECT
  ue.id,
  ue.name,
  ue.slug,
  ue.description,
  ue.item_type,
  ue.cost,
  ue.attack_type,
  ue.range,
  ue.damage,
  ue.armor,
  ue.properties,
  ue.slot,
  ue.quantity,
  'custom' as source_type,
  ue.user_id,
  up.display_name as creator_name,
  ue.is_public,
  ue.created_at,
  ue.updated_at
FROM user_equipment ue
JOIN user_profiles up ON ue.user_id = up.id
WHERE ue.is_public = true;
```

## Relationships

```
user_profiles 1──┬──N user_equipment
                 │
adventure_lists ─┼──N adventure_list_items
                 │     ↓ (polymorphic via item_type + item_id)
user_equipment ──┴──N adventure_list_items (item_type='user_equipment')
```

## Validation Rules (Zod Schema)

```typescript
const EquipmentCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  item_type: z.enum(["armor", "weapon", "gear"]),
  cost: z.object({
    amount: z.number().min(0),
    currency: z.enum(["gp", "sp", "cp"]),
  }),
  attack_type: z.string().max(50).optional(),
  range: z.string().max(100).optional(),
  damage: z.string().max(100).optional(),
  armor: z.string().max(50).optional(),
  properties: z.array(z.string().max(50)).default([]),
  slot: z.number().int().min(0).max(10).default(1),
  quantity: z.string().max(50).optional(),
  is_public: z.boolean().default(false),
});
```

## Adventure List Items Update

Need to update `adventure_list_items_item_type_check` constraint:

```sql
-- Add 'user_equipment' to valid item types
ALTER TABLE adventure_list_items
DROP CONSTRAINT adventure_list_items_item_type_check;

ALTER TABLE adventure_list_items
ADD CONSTRAINT adventure_list_items_item_type_check
CHECK (item_type IN ('monster', 'spell', 'magic_item', 'equipment', 'user_equipment', 'encounter_table'));
```

Also need to update `get_adventure_list_items` function to handle 'user_equipment' type.
