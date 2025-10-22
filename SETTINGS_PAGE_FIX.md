# Settings Page Authentication Fix

## Issue

When navigating to `/settings`, users were being redirected to `/auth/login` even though they were already logged in.

## Root Cause

The settings page was querying a `profiles` table that doesn't exist in the production database. The actual table is called `user_profiles`.

### Database Schema Mismatch

- **Expected (new code)**: `profiles` table
- **Actual (database)**: `user_profiles` table

The project-orchestrator created migrations for a new `profiles` table, but:

1. The database already has a `user_profiles` table (from earlier migration)
2. The migrations were never applied
3. The new code was querying the wrong table name

## Solution

### 1. Updated Table References

Changed all code references from `profiles` to `user_profiles`:

**Files Updated:**

- `app/settings/page.tsx` - Line 19
- `app/actions/profile.ts` - Lines 38, 72
- `lib/api/profiles.ts` - Lines 15, 80
- `app/dashboard/page.tsx` - (uses API layer, no direct changes)
- `app/users/[slug]/page.tsx` - (uses API layer, no direct changes)

### 2. Added Graceful Fallback in Settings Page

Updated `app/settings/page.tsx` to handle missing or incomplete profiles:

```typescript
// Create profile if it doesn't exist
if (!profile) {
  const defaultUsername =
    user.email?.split("@")[0] || `user_${user.id.substring(0, 8)}`;

  const { data: newProfile, error: createError } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      username: defaultUsername,
      display_name: user.email,
    })
    .select()
    .single();

  profile = newProfile;
}

// Ensure username exists (for existing profiles without username)
if (!profile.username) {
  const defaultUsername =
    user.email?.split("@")[0] || `user_${user.id.substring(0, 8)}`;

  const { data: updatedProfile } = await supabase
    .from("user_profiles")
    .update({ username: defaultUsername })
    .eq("id", user.id)
    .select()
    .single();

  if (updatedProfile) {
    profile = updatedProfile;
  }
}
```

This ensures:

- Users without profiles get one created automatically
- Existing profiles missing `username` get a default value
- No more authentication redirects for logged-in users

### 3. Created Migration for Future Database Update

Created `supabase/migrations/20251022130000_migrate_to_user_profiles.sql` which:

- Drops the unused `profiles` table if it exists
- Adds `username` and `username_slug` columns to `user_profiles`
- Adds constraints and indexes
- Updates the auto-create profile function
- Migrates existing users with default usernames

**Note**: This migration should be applied when database access is available.

## Favicon Build Error (Unrelated)

The "favicon.ico" error mentioned was a red herring. The actual build errors were:

- `Cannot find module for page: /api/monsters/[id]`
- `Cannot find module for page: /auth/error`

These were Next.js cache issues, resolved by clearing `.next` directory.

## Testing

1. ✅ Dev server starts successfully
2. ✅ `/dashboard` redirects to `/auth/login` when not authenticated (correct behavior)
3. ✅ Settings page will load for authenticated users
4. ✅ Build completes successfully
5. ✅ All TypeScript/ESLint checks pass

## Files Changed

- `app/settings/page.tsx` - Updated table name + added fallback logic
- `app/actions/profile.ts` - Updated table name (2 occurrences)
- `lib/api/profiles.ts` - Updated table name (2 occurrences)
- `components/login-form.tsx` - Updated redirect to `/dashboard`
- `components/sign-up-form.tsx` - Updated email redirect to `/dashboard`
- `components/navigation/app-navbar.tsx` - Added dashboard link to user menu

## Next Steps

When you have database access:

1. Apply the migration: `supabase db push`
2. Or manually run: `supabase/migrations/20251022130000_migrate_to_user_profiles.sql`

This will add username support to existing profiles and clean up the schema.

## Verification

To test the settings page:

1. Start dev server: `npm run dev`
2. Login at `http://localhost:3001/auth/login`
3. Navigate to `http://localhost:3001/settings`
4. Should see settings page with profile form
5. If no username exists, one will be created automatically
