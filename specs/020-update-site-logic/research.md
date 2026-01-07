# Research: Admin Abilities - Magic Item Editing

**Feature**: 020-update-site-logic
**Date**: 2026-01-06

## Executive Summary

The codebase already has admin infrastructure in place (`user_profiles.is_admin`). User magic items already support admin editing via RLS policies and API routes. The main gaps are:

1. Official magic items have no UPDATE/DELETE policies
2. Frontend doesn't check admin status for showing edit controls
3. No warning modal exists for editing official/core content

## Current State Analysis

### 1. Admin Infrastructure

**Decision**: Use existing `is_admin` flag in `user_profiles` table
**Rationale**: Already established pattern across entire codebase
**Alternatives Considered**: Role-based access control (RBAC) - rejected as overkill for single admin capability

#### Existing Pattern

```sql
-- Standard admin check in RLS policies
EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
```

#### API Pattern

```typescript
// Standard admin check in API routes
const { data: profile } = await supabase
  .from("user_profiles")
  .select("is_admin")
  .eq("id", user.id)
  .single();

if (existing.user_id !== user.id && !profile?.is_admin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### 2. Magic Items Database Structure

| Table                  | RLS SELECT   | RLS UPDATE | RLS DELETE | Admin Override |
| ---------------------- | ------------ | ---------- | ---------- | -------------- |
| `official_magic_items` | Public       | None       | None       | **NEEDED**     |
| `user_magic_items`     | Owner/Public | Owner      | Owner      | Already exists |

**Decision**: Add UPDATE policy to `official_magic_items` for admins only
**Rationale**: Allows admins to correct errors in core content
**Alternatives Considered**: Create shadow table for admin overrides - rejected as adds complexity

### 3. Frontend Edit Flow

#### Current Flow (MagicItemActionMenu.tsx:50)

```typescript
const isOwner = item.user_id === userId;
// ...
onEdit={isOwner ? handleEdit : undefined}
```

**Decision**: Add `isAdmin` prop and check `isOwner || isAdmin`
**Rationale**: Minimal change to existing pattern
**Alternatives Considered**: Higher-order component for admin - rejected as overengineering

#### Current Edit Page (app/magic-items/[slug]/edit/page.tsx:33-38)

```typescript
const { data: item } = await supabase
  .from("user_magic_items")
  .select("*")
  .eq("user_id", user.id) // Only fetches user's own items
  .eq("slug", slug)
  .single();
```

**Gap**: Cannot fetch official items or other users' items for editing

### 4. Warning Modal Pattern

**Decision**: Use shadcn/ui AlertDialog for official item warning
**Rationale**: Consistent with existing modal patterns in codebase
**Alternatives Considered**: Toast warning - rejected as too dismissable for this action

## Implementation Approach

### Database Layer

1. Add UPDATE policy to `official_magic_items` for admins
2. Optionally add DELETE policy (if admins need to remove items)

### API Layer

1. Create `/api/official/magic-items/[id]` route for admin updates
2. Or extend existing route to handle both tables

### Frontend Layer

1. Pass `isAdmin` prop through component hierarchy
2. Modify edit page to:
   - Fetch admin status
   - Query both tables (official + user)
   - Handle admin access for any item
3. Add `OfficialEditWarningDialog` component

### Admin Status Delivery

**Decision**: Pass `isAdmin` from server component to client components
**Rationale**: Server components can query user_profiles directly
**Alternatives Considered**:

- React Context - adds complexity
- Client-side fetch - adds latency

## Key Findings

### Files Requiring Changes

| File                                               | Change Type | Description                            |
| -------------------------------------------------- | ----------- | -------------------------------------- |
| `supabase/migrations/NEW`                          | Add         | UPDATE policy for official_magic_items |
| `app/magic-items/[slug]/page.tsx`                  | Modify      | Pass isAdmin to client                 |
| `app/magic-items/[slug]/MagicItemDetailClient.tsx` | Modify      | Accept isAdmin prop                    |
| `components/magic-items/MagicItemActionMenu.tsx`   | Modify      | Check isAdmin for edit                 |
| `components/entity-action-menu.tsx`                | Modify      | Support isAdmin override               |
| `app/magic-items/[slug]/edit/page.tsx`             | Modify      | Admin access, both tables              |
| `app/api/official/magic-items/[id]/route.ts`       | Add         | Admin update endpoint                  |
| `components/magic-items/OfficialEditWarning.tsx`   | Add         | Warning dialog                         |

### Existing Patterns to Follow

1. **RLS Admin Pattern**: `EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)`
2. **API Admin Check**: Query `user_profiles.is_admin` before operations
3. **Dialog Pattern**: Use `AlertDialog` from shadcn/ui
4. **Component Props**: Pass boolean flags down through hierarchy

## Open Questions - RESOLVED

1. **Can admins edit official items?** → Yes, with warning modal
2. **Concurrent edits?** → Last-write-wins, no special handling
3. **Audit trail?** → Not required

## Risk Assessment

| Risk                                  | Likelihood | Impact | Mitigation              |
| ------------------------------------- | ---------- | ------ | ----------------------- |
| Accidental official item modification | Medium     | High   | Warning modal           |
| Admin abuse                           | Low        | Medium | Trust-based (no audit)  |
| RLS policy conflicts                  | Low        | Low    | Test in dev environment |
