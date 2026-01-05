# Quickstart: User Equipment CRUD

**Feature**: 019-update-equipment-to
**Date**: 2025-01-05

## Prerequisites

- Node.js 18+
- Supabase CLI
- Local Supabase running (`supabase start`)
- Authenticated test user

## Validation Scenarios

### Scenario 1: Create Equipment

**Steps**:

1. Navigate to `/equipment`
2. Click "Create Equipment" button
3. Fill in form:
   - Name: "Mystic Blade"
   - Type: "weapon"
   - Cost: 50 gp
   - Damage: "1d8"
   - Properties: ["Versatile"]
4. Submit form

**Expected**:

- Redirect to `/equipment/mystic-blade`
- Equipment appears in user's list
- Toast: "Equipment created"

### Scenario 2: Edit Equipment

**Steps**:

1. Navigate to `/equipment/mystic-blade`
2. Click "Edit" button
3. Change name to "Mystic Blade +1"
4. Toggle "Public" on
5. Save changes

**Expected**:

- Slug updates to `mystic-blade-1` (if needed for uniqueness)
- Redirect to detail page
- Toast: "Equipment updated"
- Item visible in public equipment browse

### Scenario 3: Delete Equipment

**Steps**:

1. Navigate to `/equipment/mystic-blade-1/edit`
2. Click "Delete" button
3. Confirm in dialog

**Expected**:

- Redirect to `/equipment`
- Equipment removed from list
- Toast: "Equipment deleted"
- Any adventure list references removed (cascade)

### Scenario 4: Unauthenticated Access

**Steps**:

1. Log out
2. Navigate to `/equipment/create`

**Expected**:

- Redirect to `/auth/login?redirect=/equipment/create`

### Scenario 5: Non-Owner Edit Attempt

**Steps**:

1. Log in as User A
2. Create equipment "Test Item"
3. Log in as User B
4. Navigate to `/equipment/{user-a-item-slug}/edit` (if URL known)

**Expected**:

- 404 or Access Denied
- Cannot view edit page for other user's items

## API Validation

### Create Equipment (curl)

```bash
# Get auth token first
curl -X POST http://localhost:3000/api/user/equipment \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=xxx" \
  -d '{
    "name": "Test Sword",
    "item_type": "weapon",
    "cost": {"amount": 25, "currency": "gp"},
    "damage": "1d6",
    "is_public": false
  }'
```

Expected: 201 with created equipment JSON

### List User Equipment

```bash
curl http://localhost:3000/api/user/equipment \
  -H "Cookie: sb-xxx-auth-token=xxx"
```

Expected: 200 with paginated list

### Update Equipment

```bash
curl -X PUT http://localhost:3000/api/user/equipment/{id} \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=xxx" \
  -d '{"name": "Updated Sword", "is_public": true}'
```

Expected: 200 with updated equipment

### Delete Equipment

```bash
curl -X DELETE http://localhost:3000/api/user/equipment/{id} \
  -H "Cookie: sb-xxx-auth-token=xxx"
```

Expected: 204 No Content

## Database Validation

### Check user_equipment table

```sql
SELECT * FROM user_equipment WHERE user_id = 'test-user-id';
```

### Check cascade delete

```sql
-- Before delete
SELECT * FROM adventure_list_items WHERE item_type = 'user_equipment';

-- Delete user equipment
DELETE FROM user_equipment WHERE id = 'xxx';

-- After delete - should be empty for that item
SELECT * FROM adventure_list_items WHERE item_id = 'xxx';
```

### Check all_equipment view

```sql
SELECT * FROM all_equipment WHERE source_type = 'custom';
```

## Performance Checks

- Equipment list load: < 500ms
- Create equipment: < 1s
- Edit page load: < 500ms
- Fuzzy search response: < 500ms

## Cleanup

```sql
-- Remove test data
DELETE FROM user_equipment WHERE name LIKE 'Test%';
```
