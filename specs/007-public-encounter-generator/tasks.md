# Implementation Tasks: Public Encounter Generator

## Task List

### Backend

- [ ] **Task 1.1**: Update middleware to add `/encounter-tables/new` to publicRoutes
  - File: `lib/supabase/middleware.ts`
  - Add route to array

- [ ] **Task 1.2**: Remove auth requirement from preview API
  - File: `app/api/encounter-tables/preview/route.ts`
  - Remove getUser() check
  - Keep validation

### Frontend

- [ ] **Task 2.1**: Add auth detection to EncounterForm
  - File: `app/encounter-tables/new/EncounterForm.tsx`
  - Import createClient from client
  - Add user, isAuthenticated state
  - Add useEffect for auth check

- [ ] **Task 2.2**: Add localStorage persistence
  - File: `app/encounter-tables/new/EncounterForm.tsx`
  - Save to localStorage in generatePreview
  - Restore from localStorage on mount (if authenticated)
  - Show toast on restore
  - Handle errors

- [ ] **Task 2.3**: Update save button state
  - File: `app/encounter-tables/new/EncounterForm.tsx`
  - Disable when !isAuthenticated
  - Pass isAuthenticated to EncounterTablePreview

- [ ] **Task 2.4**: Add alert banner
  - File: `app/encounter-tables/new/EncounterForm.tsx`
  - Render Alert when !isAuthenticated && previewData
  - Include Link to /auth/login

- [ ] **Task 2.5**: Update EncounterTablePreview props
  - File: `app/encounter-tables/new/EncounterTablePreview.tsx`
  - Add isAuthenticated to Props
  - Update save button disabled logic
  - Add sign-in helper text

### Testing

- [ ] **Task 3.1**: E2E test - unauthenticated generation
  - Verify route accessible
  - Verify preview generates

- [ ] **Task 3.2**: E2E test - save gating
  - Verify button disabled
  - Verify alert visible

- [ ] **Task 3.3**: E2E test - login flow
  - Generate table
  - Login
  - Verify data restored
  - Save successfully

- [ ] **Task 3.4**: Manual testing
  - All user flows
  - Edge cases
  - Mobile responsive

## Execution Order

1. Backend changes (Tasks 1.1, 1.2) - unblock frontend
2. Frontend auth detection (Task 2.1) - foundation
3. Frontend UI updates (Tasks 2.3, 2.4, 2.5) - user-facing
4. localStorage persistence (Task 2.2) - enhancement
5. Testing (Tasks 3.1-3.4) - validation

## Definition of Done

- [ ] Unauthenticated users can access `/encounter-tables/new`
- [ ] Unauthenticated users can generate preview
- [ ] Save button disabled for unauthenticated
- [ ] Alert banner shows sign-in CTA
- [ ] Table data persists through login
- [ ] Authenticated users can save
- [ ] E2E tests pass
- [ ] No console errors
- [ ] Mobile responsive
