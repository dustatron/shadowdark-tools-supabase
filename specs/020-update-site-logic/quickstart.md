# Quickstart: Admin Abilities - Magic Item Editing

**Feature**: 020-update-site-logic
**Date**: 2026-01-06

## Prerequisites

1. Running Next.js dev server (`npm run dev`)
2. Supabase connected
3. Admin user account (user_profiles.is_admin = true)
4. Non-admin user account (for testing restrictions)

## Setup: Create Test Admin User

```sql
-- Make a user an admin (run in Supabase SQL editor)
UPDATE user_profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID';
```

## Test Scenarios

### Scenario 1: Admin Can Edit User Magic Item

**Given**: Logged in as admin user
**And**: A user-created magic item exists (created by another user)

1. Navigate to `/magic-items`
2. Find a user-created magic item (not your own)
3. Click on the item to view details
4. Click the action menu (three dots)
5. **Verify**: "Edit" option is visible
6. Click "Edit"
7. **Verify**: Edit form loads with item data
8. Modify the name field
9. Click "Save"
10. **Verify**: Item is updated, redirected to detail page

**Expected Result**: Admin successfully edits another user's magic item

---

### Scenario 2: Admin Can Edit Official Magic Item (With Warning)

**Given**: Logged in as admin user
**And**: An official magic item exists

1. Navigate to `/magic-items`
2. Find an official magic item (e.g., "Bag of Holding")
3. Click on the item to view details
4. Click the action menu (three dots)
5. **Verify**: "Edit" option is visible
6. Click "Edit"
7. **Verify**: Warning modal appears with message about editing core Shadowdark content
8. Click "Continue" to confirm
9. **Verify**: Edit form loads with item data
10. Modify the description field
11. Click "Save"
12. **Verify**: Item is updated, redirected to detail page

**Expected Result**: Admin successfully edits official magic item after warning

---

### Scenario 3: Non-Admin Cannot Edit Others' Items

**Given**: Logged in as regular (non-admin) user
**And**: A magic item exists created by another user

1. Navigate to `/magic-items`
2. Find a magic item created by another user
3. Click on the item to view details
4. Click the action menu (three dots)
5. **Verify**: "Edit" option is NOT visible
6. Try navigating directly to `/magic-items/[slug]/edit`
7. **Verify**: Redirected or shown "Not Found" page

**Expected Result**: Non-admin cannot edit items they don't own

---

### Scenario 4: Owner Can Still Edit Own Items

**Given**: Logged in as regular (non-admin) user
**And**: A magic item exists created by this user

1. Navigate to `/magic-items/my-items`
2. Find one of your magic items
3. Click on the item to view details
4. Click the action menu (three dots)
5. **Verify**: "Edit" option is visible
6. Click "Edit"
7. **Verify**: Edit form loads (no warning modal)
8. Modify the name field
9. Click "Save"
10. **Verify**: Item is updated

**Expected Result**: Owner can edit their own items (existing functionality preserved)

---

### Scenario 5: Admin Edit Preserves Original Owner

**Given**: Logged in as admin user
**And**: A user-created magic item exists (created by User B)

1. Navigate to that magic item's detail page
2. Edit the item as admin
3. Save changes
4. **Verify**: `user_id` still shows User B as owner
5. **Verify**: Item still appears in User B's "My Items" list

**Expected Result**: Admin edit doesn't change ownership attribution

---

## API Testing (curl)

### Test Admin Update Official Item

```bash
# Get auth token (login as admin first)
TOKEN="your_supabase_access_token"

# Update official magic item
curl -X PUT "http://localhost:3000/api/official/magic-items/ITEM_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Item Name",
    "description": "Updated description text"
  }'
```

**Expected**: 200 OK with updated item data

### Test Non-Admin Cannot Update Official Item

```bash
# Get auth token (login as non-admin)
TOKEN="non_admin_token"

# Attempt to update official magic item
curl -X PUT "http://localhost:3000/api/official/magic-items/ITEM_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Attempted Update"
  }'
```

**Expected**: 403 Forbidden

## Validation Checklist

- [ ] Admin sees Edit on all magic items (official + user-created)
- [ ] Non-admin only sees Edit on own items
- [ ] Warning modal shows for official items
- [ ] Edit form pre-fills with existing data
- [ ] Changes persist after save
- [ ] Original owner preserved on user items
- [ ] API returns 403 for non-admin on official items
- [ ] No console errors during flow
