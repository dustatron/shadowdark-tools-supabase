# Data Model: Admin Abilities - Magic Item Editing

**Feature**: 020-update-site-logic
**Date**: 2026-01-06

## Overview

This feature extends the existing data model by adding admin write access to `official_magic_items`. No new tables are created.

## Entities

### 1. user_profiles (Existing - No Changes)

The admin flag is already present and used for this feature.

| Field        | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| id           | UUID    | Primary key (matches auth.users.id)        |
| display_name | TEXT    | User's display name                        |
| is_admin     | BOOLEAN | **Used for admin access** (default: false) |
| ...          | ...     | Other existing fields                      |

### 2. official_magic_items (Existing - Policy Changes Only)

**Current State**: Read-only (SELECT policy only)
**New State**: Admin-writable (add UPDATE policy)

| Field       | Type        | Description            |
| ----------- | ----------- | ---------------------- |
| id          | UUID        | Primary key            |
| name        | TEXT        | Display name           |
| slug        | TEXT        | URL-safe identifier    |
| description | TEXT        | Item description       |
| traits      | JSONB       | Array of trait objects |
| created_at  | TIMESTAMPTZ | Creation timestamp     |
| updated_at  | TIMESTAMPTZ | Last modification      |

#### New RLS Policy: Admin Update

```sql
-- Allow admins to update official magic items
CREATE POLICY "Admins can update official magic items"
ON public.official_magic_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

### 3. user_magic_items (Existing - No Changes)

Already has admin access via existing RLS policies:

- UPDATE: `user_id = auth.uid() OR is_admin`
- DELETE: `user_id = auth.uid() OR is_admin`

No changes needed.

## Validation Rules

### Magic Item Update Validation (Both Tables)

Zod schema for updates (same for official and user items):

```typescript
const MagicItemUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(5000).optional(),
  traits: z.array(TraitSchema).optional(),
  // Note: slug is auto-generated from name if name changes
});

const TraitSchema = z.object({
  type: z.enum(["Benefit", "Curse", "Bonus", "Personality"]),
  description: z.string().min(1),
});
```

### Admin Access Validation

```typescript
// Check performed before allowing edit operations
const isAdmin = await checkAdminStatus(supabase, userId);
if (!isOwner && !isAdmin) {
  throw new ForbiddenError("Cannot edit items you don't own");
}
```

## State Transitions

### Edit Flow State Machine

```
┌─────────────┐
│   Viewing   │
│  Magic Item │
└──────┬──────┘
       │ User clicks "Edit"
       ▼
┌──────────────────┐
│ Check Permissions│
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
 isOwner?  isAdmin?
    │         │
    ▼         ▼
  ┌───┐    ┌───┐
  │Yes│    │Yes│
  └─┬─┘    └─┬─┘
    │        │
    │   ┌────┴─────────────┐
    │   │ Is Official Item?│
    │   └────┬─────────────┘
    │        │
    │   ┌────┴────┐
    │   ▼         ▼
    │  Yes        No
    │   │         │
    │   ▼         │
    │ ┌─────────┐ │
    │ │ Warning │ │
    │ │  Modal  │ │
    │ └────┬────┘ │
    │      │      │
    │ Confirm?    │
    │      │      │
    │   ┌──┴──┐   │
    │   ▼     ▼   │
    │  Yes    No──┼───► Back to View
    │   │         │
    └───┴────┬────┘
             │
             ▼
      ┌──────────┐
      │Edit Form │
      └────┬─────┘
           │ Save
           ▼
      ┌──────────┐
      │ API Call │
      └────┬─────┘
           │
    ┌──────┴──────┐
    ▼             ▼
 Success       Error
    │             │
    ▼             ▼
 Redirect      Toast
 to Detail    Message
```

## Relationships

```
user_profiles 1──────────────────────────────────0..* user_magic_items
    │                                                      │
    │ is_admin = true                                      │
    │                                                      │
    └───── can UPDATE ─────► official_magic_items          │
    │                                                      │
    └───── can UPDATE ─────────────────────────────────────┘
```

## Migration Requirements

### New Migration: Add Admin UPDATE Policy

**File**: `supabase/migrations/YYYYMMDDHHMMSS_add_admin_update_official_magic_items.sql`

```sql
-- Migration: Add admin UPDATE policy to official_magic_items
-- Feature: 020-update-site-logic

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update official magic items"
ON public.official_magic_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Optional: Add DELETE policy for admins (for future use)
CREATE POLICY "Admins can delete official magic items"
ON public.official_magic_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

## API Data Contracts

See [contracts/](./contracts/) for full OpenAPI specifications.

### Summary of Endpoints

| Endpoint                         | Method | Auth        | Description                       |
| -------------------------------- | ------ | ----------- | --------------------------------- |
| `/api/official/magic-items/[id]` | PUT    | Admin       | Update official magic item        |
| `/api/user/magic-items/[id]`     | PUT    | Owner/Admin | Update user magic item (existing) |
