# Implementation Plan: Public Encounter Generator

## Overview

Make encounter table generator publicly accessible with conditional save for authenticated users.

## Tasks

### 1. Middleware Updates

**File:** `lib/supabase/middleware.ts`

- Add `/encounter-tables/new` to publicRoutes array
- Test route accessible without auth

### 2. Remove Auth from Preview API

**File:** `app/api/encounter-tables/preview/route.ts`

- Remove auth check from POST handler
- Keep validation and generation logic
- Test unauthenticated preview generation

### 3. Update EncounterForm Component

**File:** `app/encounter-tables/new/EncounterForm.tsx`

**3a. Add auth detection**

- Import Supabase client
- Add user state
- Add isAuthenticated state
- Create useEffect for auth check

**3b. Add localStorage persistence**

- Save previewData to localStorage on generate (if unauthenticated)
- Restore from localStorage on mount (if authenticated)
- Clear localStorage after restore
- Handle quota errors
- Show toast on restore

**3c. Update save button**

- Disable when !isAuthenticated
- Add disabled prop to button

**3d. Add alert banner**

- Import Alert components
- Render below form when !isAuthenticated && previewData
- Include sign-in link

### 4. Update EncounterTablePreview Component

**File:** `app/encounter-tables/new/EncounterTablePreview.tsx`

**4a. Add isAuthenticated prop**

- Update Props interface
- Pass from parent

**4b. Update save button**

- Disable based on isAuthenticated
- Add helper text with sign-in link

### 5. Testing

**5a. E2E Tests**

- Test unauthenticated generation
- Test save button disabled
- Test alert banner visible
- Test login flow with data persistence
- Test authenticated save

**5b. Manual Testing**

- Verify route accessible
- Verify preview works
- Verify save disabled
- Verify alert shows
- Verify login flow

## Dependencies

None - all changes are isolated to encounter-tables/new

## Risk Mitigation

- Preview API already stateless, safe to make public
- Save API already has auth checks
- LocalStorage has quota limits - handle gracefully
- No PII in localStorage (just table config)

## Rollback Plan

- Revert middleware change
- Restore auth check in preview API
- Deploy

## Estimated Effort

- Middleware: 5min
- Preview API: 5min
- EncounterForm: 45min
- EncounterTablePreview: 15min
- Testing: 30min
- **Total: ~2 hours**
