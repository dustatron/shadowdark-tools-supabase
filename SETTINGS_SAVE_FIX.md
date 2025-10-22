# Settings Save Error - Fix

## Issue

When trying to save changes in the settings page, users were getting an error.

## Root Cause

The `user_profiles` table in the database **does not have a `username` column**.

The existing schema only has:

- `id`
- `display_name`
- `bio`
- `avatar_url`
- `is_admin`
- `created_at`
- `updated_at`

But our code was trying to update a `username` field that doesn't exist, causing the save operation to fail.

## Solution

### 1. Made Server Action Backwards Compatible

Updated `app/actions/profile.ts` to conditionally include `username` only if the column exists:

```typescript
// Build update object (only include fields that exist in database)
const updateData: Record<string, any> = {
  display_name: result.data.display_name || null,
  bio: result.data.bio || null,
};

// Check if username column exists
const { data: existingProfile } = await supabase
  .from("user_profiles")
  .select("username")
  .eq("id", user.id)
  .single();

// Only include username if the column exists
if (existingProfile && "username" in existingProfile) {
  const available = await isUsernameAvailable(result.data.username, user.id);
  if (!available) {
    return { error: "Username already taken" };
  }
  updateData.username = result.data.username;
}

// Update profile with only existing fields
const { data: profile, error } = await supabase
  .from("user_profiles")
  .update(updateData)
  .eq("id", user.id)
  .select()
  .single();
```

This ensures:

- Display name and bio can be saved immediately
- Username field is skipped if the column doesn't exist
- No database errors when saving

### 2. Disabled Username Field in Form

Updated `components/settings/ProfileSettingsForm.tsx`:

```typescript
<TextInput
  label="Username"
  description="Username feature coming soon (requires database migration)"
  disabled  // <-- Field is now disabled
  {...form.register("username")}
  error={form.formState.errors.username?.message}
/>
```

This:

- Shows the username field (read-only)
- Informs users it's coming soon
- Prevents confusion about why it can't be edited

### 3. Improved Error Messages

Added better error logging in the server action:

```typescript
if (error) {
  console.error("Profile update error:", error);
  return { error: `Failed to update profile: ${error.message}` };
}
```

Now errors will show specific database error messages for easier debugging.

## What Works Now

✅ **Display Name** - Can be saved successfully
✅ **Bio** - Can be saved successfully
🔒 **Username** - Disabled (requires database migration)
✅ **Avatar Upload** - Works independently

## Testing

1. Go to `http://localhost:3001/settings`
2. Update your display name and/or bio
3. Click "Save Changes"
4. Should see "Profile updated successfully" notification
5. Changes should persist on page reload

## When Username Will Work

The username field will become editable after applying the database migration:

```bash
supabase db push
```

This will run `supabase/migrations/20251022130000_migrate_to_user_profiles.sql` which:

- Adds `username` column to `user_profiles`
- Adds `username_slug` column (auto-generated from username)
- Adds unique constraints
- Migrates existing users with default usernames

## Files Changed

- `app/actions/profile.ts` - Made username conditional
- `components/settings/ProfileSettingsForm.tsx` - Disabled username field
- `app/settings/page.tsx` - Handle missing username gracefully

## Summary

The settings page can now save display name and bio changes successfully. The username feature is temporarily disabled until the database migration can be applied.
