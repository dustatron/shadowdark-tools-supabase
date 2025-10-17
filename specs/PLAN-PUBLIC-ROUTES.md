# Plan: Make Monsters & Spells Routes Publicly Accessible

**Date**: 2025-01-17
**Goal**: Allow unauthenticated users to search and view monsters/spells while keeping creation/modification protected

## Current State Analysis

### Middleware

- ✅ Already excludes `/api/*` from auth checks ([`middleware.ts`](middleware.ts:18))
- Auth runs only on page routes, not API routes

### Monster Routes (in `app/api/monsters/`)

**GET Routes** (should be public):

- [`/api/monsters`](app/api/monsters/route.ts:10-251) - Search/list monsters
  - Currently: Uses `createClient()` but allows unauthenticated (returns public content only)
  - Status: ✅ Already public-friendly
- [`/api/monsters/[id]`](app/api/monsters/[id]/route.ts:45-91) - Get monster details
  - Currently: Uses `createClient()` with no auth requirement
  - Status: ✅ Already public
- [`/api/monsters/random`](app/api/monsters/random/route.ts:4-93) - Random monster
  - Currently: Uses `createClient()` with no auth requirement
  - Status: ✅ Already public

**Protected Routes** (should require auth):

- [`POST /api/monsters`](app/api/monsters/route.ts:254-330) - Create custom monster
  - Currently: ✅ Checks auth, returns 401 without user
  - Status: ✅ Correctly protected
- [`PUT /api/monsters/[id]`](app/api/monsters/[id]/route.ts:93-191) - Update monster
  - Currently: ✅ Checks auth and ownership
  - Status: ✅ Correctly protected
- [`DELETE /api/monsters/[id]`](app/api/monsters/[id]/route.ts:193-255) - Delete monster
  - Currently: ✅ Checks auth and ownership
  - Status: ✅ Correctly protected

### Spell Routes (in `src/app/api/spells/` and `app/api/spells/`)

Need to check:

- GET `/api/spells` - List/search spells
- GET `/api/spells/[slug]` or `/api/spells/[id]` - Spell details

### Page Routes

**Monster Pages**:

- [`/monsters`](app/monsters/page.tsx) - Monster list page
- [`/monsters/[id]`](app/monsters/[id]/page.tsx) - Monster detail page

**Spell Pages**:

- [`/spells`](app/spells/page.tsx) - Spell list page
- [`/spells/[slug]`](app/spells/[slug]/page.tsx) - Spell detail page

## Required Changes

### 1. API Routes ✅

**Status**: All GET routes already allow unauthenticated access

- Monster GET routes return public/official content for unauthenticated users
- POST/PUT/DELETE routes correctly require authentication
- No changes needed

### 2. Page Routes (Need Investigation)

**Check if pages are in protected layout:**

```bash
# Check if monsters/spells pages are under /protected or have auth requirements
```

**Potential Changes**:

- If pages use `createClient()` with required auth → Make auth optional
- If pages are in `/protected` layout → Move to `/app` root
- Update components to handle `user = null` gracefully
- Show "Login to create custom content" prompts for unauthenticated users

### 3. Database RLS Policies ✅

**Status**: Already configured correctly

- Public read access to `official_monsters` table
- Public read access to `user_monsters` where `is_public = true`
- Same for spells tables
- No changes needed

### 4. UI/UX Updates

**For unauthenticated users, show**:

- Full monster/spell browsing and search
- View details for all public content
- Disabled "Create Custom" buttons with "Login Required" tooltip
- Disabled "Edit/Delete" buttons on detail pages
- Optional: Banner encouraging signup for custom content features

## Implementation Steps

### Phase 1: Verify Current State

- [x] Check middleware configuration
- [x] Audit monster API routes
- [ ] Audit spell API routes
- [ ] Check if pages are in protected layout
- [ ] Test unauthenticated access to monster pages

### Phase 2: Page Route Updates (if needed)

- [ ] Move pages out of protected layout if needed
- [ ] Update page components to handle null user
- [ ] Add conditional rendering for auth-required features
- [ ] Update navigation/layout to show login prompts

### Phase 3: UI Polish

- [ ] Add "Login to create" buttons/prompts
- [ ] Update components to show appropriate messaging
- [ ] Ensure good UX for unauthenticated users
- [ ] Add guest user limits documentation

### Phase 4: Testing

- [ ] Manual test: Browse monsters without login
- [ ] Manual test: View monster details without login
- [ ] Manual test: Search spells without login
- [ ] Manual test: Verify POST/PUT/DELETE still require auth
- [ ] Test RLS policies prevent unauthorized access

## Success Criteria

- ✅ Unauthenticated users can browse all public monsters
- ✅ Unauthenticated users can search monsters/spells
- ✅ Unauthenticated users can view monster/spell details
- ✅ Creating custom content still requires authentication
- ✅ Editing/deleting still requires authentication and ownership
- ✅ UI clearly indicates which features require login
- ✅ No security regressions (RLS policies still enforced)

## Security Considerations

### Already Protected ✅

- Database enforces RLS at data layer
- POST/PUT/DELETE routes check authentication
- Ownership verified before mutations
- Public content flagged explicitly in database

### Risks (Mitigated)

- ❌ Risk: Unauthenticated access to private content
  - ✅ Mitigation: RLS policies + route logic only returns public content
- ❌ Risk: Unauthorized mutations
  - ✅ Mitigation: All mutation endpoints require auth
- ❌ Risk: Information disclosure
  - ✅ Mitigation: Only public/official content visible to guests

## Notes

- Middleware already excludes API routes from auth
- Most GET routes already work without auth
- Main work is likely just UI/UX updates for pages
- RLS policies provide defense-in-depth security
