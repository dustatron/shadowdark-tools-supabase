# Quickstart: User-Generated Magic Items

**Feature**: 012-for-magic-items
**Date**: 2025-12-05

## User Flows

### Flow 1: Create a Magic Item

1. Navigate to `/magic-items`
2. Click "Create Magic Item" button (auth required)
3. Fill form: name, description, traits
4. Toggle visibility (private by default)
5. Submit → redirected to item detail page
6. Verify: item appears in "My Items" list

### Flow 2: Edit a Magic Item

1. Navigate to `/magic-items/my-items` or item detail
2. Click "Edit" on owned item
3. Modify fields
4. Save → see updated values
5. Verify: changes persisted

### Flow 3: Toggle Visibility

1. View owned item
2. Click visibility toggle (private ↔ public)
3. Verify: public items show in main browse
4. Verify: private items only visible to owner

### Flow 4: View Source Attribution

1. Browse `/magic-items`
2. Official items: show "Core Rules" badge
3. Community items: show creator username
4. Click username → view creator's public items

### Flow 5: Delete a Magic Item

1. View owned item detail
2. Click "Delete" button
3. Confirm deletion
4. Verify: item removed from lists

---

## Validation Scenarios

### Happy Path

- Create item with valid name/description/traits → success
- Update item with partial fields → success
- Delete own item → success

### Error Cases

- Create without auth → 401
- Create with empty name → 400 validation error
- Edit other user's item → 403
- Delete other user's item → 403
- View private item (not owner) → 404

---

## Smoke Test Checklist

- [ ] Create magic item form accessible when logged in
- [ ] Form validates required fields
- [ ] Slug auto-generated from name
- [ ] New item appears in user's items
- [ ] Toggle visibility works
- [ ] Public items appear in browse
- [ ] Source shows "Core Rules" for official
- [ ] Source shows username for custom
- [ ] Edit form pre-populates values
- [ ] Delete removes item
- [ ] Private items hidden from other users
