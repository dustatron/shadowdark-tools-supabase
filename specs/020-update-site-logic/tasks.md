# Tasks: Admin Abilities - Magic Item Editing

**Feature**: 020-update-site-logic
**Input**: Design documents from `/specs/020-update-site-logic/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Task Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- All paths are relative to repository root

---

## Phase 3.1: Database Setup

- [x] T001 Create migration `supabase/migrations/YYYYMMDDHHMMSS_add_admin_policies_official_magic_items.sql` with UPDATE and DELETE policies for admins on official_magic_items table (see data-model.md for exact SQL)

- [x] T002 Apply migration to Supabase using `npx supabase db push`

---

## Phase 3.2: Tests First (TDD)

**CRITICAL: These tests MUST be written and MUST FAIL before implementation**

- [x] T003 [P] E2E test: Admin can edit user magic item - Create `__tests__/e2e/admin-magic-item-edit.spec.ts` with test for Scenario 1 from quickstart.md (admin edits another user's magic item)

- [x] T004 [P] E2E test: Admin can edit official magic item with warning - Add test to `__tests__/e2e/admin-magic-item-edit.spec.ts` for Scenario 2 (official item edit shows warning modal)

- [x] T005 [P] E2E test: Non-admin cannot edit others' items - Add test to `__tests__/e2e/admin-magic-item-edit.spec.ts` for Scenario 3 (403/redirect for non-admin)

- [x] T006 [P] E2E test: Owner can still edit own items - Add test to `__tests__/e2e/admin-magic-item-edit.spec.ts` for Scenario 4 (existing functionality preserved)

- [x] T007 [P] E2E test: Admin edit preserves original owner - Add test to `__tests__/e2e/admin-magic-item-edit.spec.ts` for Scenario 5 (user_id unchanged after admin edit)

---

## Phase 3.3: API Implementation

- [x] T008 Create admin check helper function in `lib/services/admin.ts` - Export `checkAdminStatus(supabase, userId): Promise<boolean>` that queries user_profiles.is_admin

- [x] T009 Create official magic items API route `app/api/official/magic-items/[id]/route.ts` with PUT handler:
  - Require authentication
  - Verify admin status using helper from T008
  - Return 403 if not admin
  - Validate request body with MagicItemUpdateSchema (see data-model.md)
  - Update official_magic_items table
  - Return updated item
  - Follow pattern from contracts/official-magic-items-api.yaml

---

## Phase 3.4: Frontend Components

- [x] T010 Create `OfficialEditWarning` dialog component in `components/magic-items/OfficialEditWarning.tsx`:
  - Use shadcn/ui AlertDialog
  - Title: "Edit Official Content"
  - Description: "You are about to modify Shadowdark core ruleset content. Changes will affect all users."
  - Cancel and Continue buttons
  - Accept `open`, `onOpenChange`, `onConfirm` props

- [x] T011 Modify `components/entity-action-menu.tsx`:
  - Add optional `isAdmin?: boolean` prop to EntityActionMenuProps
  - Change edit condition from `isOwner && onEdit` to `(isOwner || isAdmin) && onEdit`
  - Keep existing behavior unchanged when isAdmin not provided

- [x] T012 Modify `components/magic-items/MagicItemActionMenu.tsx`:
  - Add `isAdmin` prop
  - Update isOwner check to include admin: `const canEdit = isOwner || isAdmin`
  - Detect if item is official (no user_id or user_id is null)
  - If admin editing official item, show OfficialEditWarning before navigating to edit
  - Pass isAdmin to EntityActionMenu

---

## Phase 3.5: Page Integration

- [x] T013 Modify `app/magic-items/[slug]/page.tsx`:
  - Query user_profiles.is_admin for current user
  - Pass `isAdmin` prop to MagicItemDetailClient

- [x] T014 Modify `app/magic-items/[slug]/MagicItemDetailClient.tsx`:
  - Accept `isAdmin?: boolean` prop
  - Pass `isAdmin` to MagicItemActionMenu

- [x] T015 Modify `app/magic-items/[slug]/edit/page.tsx`:
  - Query user_profiles.is_admin for current user
  - If admin: query both user_magic_items and official_magic_items by slug (not filtered by user_id)
  - If not admin and not owner: return notFound()
  - Detect item source (official vs user) for API endpoint selection
  - Pass source info to MagicItemForm or handle in form submission

---

## Phase 3.6: Form Submission Updates

- [x] T016 Modify `components/magic-items/MagicItemForm.tsx`:
  - Accept optional `isOfficial?: boolean` prop
  - When submitting edit for official item, use `/api/official/magic-items/[id]` endpoint
  - When submitting edit for user item, use existing `/api/user/magic-items/[id]` endpoint
  - Hide delete button for official items
  - Hide is_public toggle for official items

---

## Phase 3.7: Verification & Polish

- [ ] T017 Run all E2E tests from T003-T007 and verify they pass

- [x] T018 Run `npm run lint` and fix any linting errors (0 errors, 12 pre-existing warnings)

- [x] T019 Run `npm run build` and verify no TypeScript errors

- [ ] T020 Manual testing: Execute quickstart.md validation checklist

---

## Dependencies

```
T001 → T002 (migration must exist before push)
T002 → T009 (DB policies needed for API)
T008 → T009 (admin helper needed for API)
T010 → T012 (warning component needed in action menu)
T011 → T012 (entity menu changes needed for action menu)
T012 → T014 (action menu changes needed in detail client)
T013 → T014 (page changes enable client props)
T014 → T015 (detail client changes inform edit page pattern)
T015 → T016 (edit page determines form props)
T003-T007 → T017 (tests must exist to run)
T016 → T017 (all impl complete before verification)
```

## Parallel Execution Groups

### Group 1: E2E Tests (T003-T007) - Can all run in parallel

```bash
# These tasks create/add to the same test file but test independent scenarios
# Run sequentially within file, but file can be created in one session
```

### Group 2: Independent Components (T008, T010) - Can run in parallel

```
Task subagent_type="react-developer": "Create admin check helper in lib/services/admin.ts"
Task subagent_type="react-developer": "Create OfficialEditWarning dialog in components/magic-items/OfficialEditWarning.tsx"
```

### Group 3: Entity Menu Updates (T011) - Sequential before T012

```
Must complete T011 before T012 (T12 depends on T11 changes)
```

### Group 4: Page Integration (T013, T014, T015) - Must be sequential

```
T013 → T014 → T015 (each depends on previous)
```

---

## Validation Checklist

_GATE: Checked before marking complete_

- [ ] Migration creates correct RLS policies
- [ ] All 5 E2E test scenarios covered
- [ ] API returns 403 for non-admin
- [ ] API returns 200 for admin with valid data
- [ ] Warning modal appears for official items only
- [ ] isAdmin prop flows from server to client components
- [ ] Edit page handles both official and user items
- [ ] Form submits to correct API endpoint
- [ ] All tests pass
- [ ] Build succeeds

---

## Agent Recommendations

| Task      | Recommended Agent           |
| --------- | --------------------------- |
| T001-T002 | `data-migration-specialist` |
| T003-T007 | `test-engineer`             |
| T008-T009 | `api-route-specialist`      |
| T010-T016 | `react-developer`           |
| T017-T020 | Manual or `test-engineer`   |
