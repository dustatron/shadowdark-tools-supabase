# User Profile & Dashboard - Implementation Specification

## Overview

Implement a complete user profile system with three main pages:

- **Public Profile** (`/users/[username-slug]`) - Read-only view of user's public content
- **User Dashboard** (`/dashboard`) - Personal hub for all user content (public + private)
- **Settings** (`/settings`) - Edit profile information and preferences

## Technical Stack

- **Backend**: Supabase PostgreSQL with RLS
- **Forms**: React Hook Form + Zod validation
- **Images**: Cloudinary for avatar uploads
- **UI**: Mantine UI + Tailwind CSS
- **State**: TanStack Query for server state

---

## Phase 1: Database Setup & Authentication

### 1.1 Create Profiles Table

**File**: `supabase/migrations/[timestamp]_create_profiles.sql`

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  username_slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Indexes
CREATE INDEX idx_profiles_username_slug ON profiles(username_slug);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-generate username slug function
CREATE OR REPLACE FUNCTION generate_username_slug(username TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(username, '[^a-zA-Z0-9\\s-]', '', 'g'),
    '\\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Trigger to update slug and timestamp
CREATE OR REPLACE FUNCTION update_username_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.username_slug = generate_username_slug(NEW.username);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_username_slug
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_username_slug();
```

**Tasks**:

- [ ] Create migration file
- [ ] Test migration locally with `supabase db reset`
- [ ] Verify RLS policies with test queries
- [ ] Verify slug generation with various usernames

### 1.2 Create Favorites Table

**File**: `supabase/migrations/[timestamp]_create_favorites.sql`

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('monster', 'spell')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, item_type, item_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_item_type ON favorites(item_type);
CREATE INDEX idx_favorites_user_item ON favorites(user_id, item_type);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

**Tasks**:

- [ ] Create migration file
- [ ] Test RLS policies
- [ ] Verify unique constraint prevents duplicates

### 1.3 Update Existing Tables for Public/Private Content

**File**: `supabase/migrations/[timestamp]_add_public_flags.sql`

```sql
-- Add is_public flag to user_monsters if not exists
ALTER TABLE user_monsters
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add is_public flag to user_spells if not exists
ALTER TABLE user_spells
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add is_public flag to user_encounter_tables if not exists
ALTER TABLE user_encounter_tables
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow public content viewing
DROP POLICY IF EXISTS "Users can view public monsters" ON user_monsters;
CREATE POLICY "Users can view public monsters"
  ON user_monsters FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view public spells" ON user_spells;
CREATE POLICY "Users can view public spells"
  ON user_spells FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view public encounter tables" ON user_encounter_tables;
CREATE POLICY "Users can view public encounter tables"
  ON user_encounter_tables FOR SELECT
  USING (is_public = true OR user_id = auth.uid());
```

**Tasks**:

- [ ] Create migration file
- [ ] Verify existing tables have `is_public` column
- [ ] Test RLS policies for public/private content

### 1.4 Profile Creation on Signup

**File**: `supabase/migrations/[timestamp]_auto_create_profile.sql`

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Tasks**:

- [ ] Create migration file
- [ ] Test profile creation with new user signup
- [ ] Handle edge cases (username conflicts)

---

## Phase 2: TypeScript Types & API Layer

### 2.1 Create TypeScript Types

**File**: `lib/types/profile.types.ts`

```typescript
export interface Profile {
  id: string;
  username: string;
  username_slug: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  monstersCount: number;
  spellsCount: number;
  encounterTablesCount: number;
  favoriteMonstersCount: number;
  favoriteSpellsCount: number;
}

export interface ProfileWithStats extends Profile {
  stats: ProfileStats;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_type: "monster" | "spell";
  item_id: string;
  created_at: string;
}

export type DashboardTab =
  | "monsters"
  | "spells"
  | "encounters"
  | "favorite-monsters"
  | "favorite-spells";
```

**Tasks**:

- [ ] Create type definitions file
- [ ] Generate Supabase types: `supabase gen types typescript --local`
- [ ] Verify types match database schema

### 2.2 Create Profile API Queries

**File**: `lib/api/profiles.ts`

```typescript
import { createClient } from "@/lib/supabase/server";
import {
  Profile,
  ProfileStats,
  ProfileWithStats,
} from "@/lib/types/profile.types";

// Get profile by username slug
export async function getProfileBySlug(
  slug: string,
): Promise<ProfileWithStats | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username_slug", slug)
    .single();

  if (error || !profile) return null;

  const stats = await getProfileStats(profile.id);
  return { ...profile, stats };
}

// Get profile stats
async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = await createClient();

  const [monsters, spells, encounters, favMonsters, favSpells] =
    await Promise.all([
      supabase
        .from("user_monsters")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_public", true),

      supabase
        .from("user_spells")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_public", true),

      supabase
        .from("user_encounter_tables")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_public", true),

      supabase
        .from("favorites")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("item_type", "monster"),

      supabase
        .from("favorites")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("item_type", "spell"),
    ]);

  return {
    monstersCount: monsters.count || 0,
    spellsCount: spells.count || 0,
    encounterTablesCount: encounters.count || 0,
    favoriteMonstersCount: favMonsters.count || 0,
    favoriteSpellsCount: favSpells.count || 0,
  };
}

// Check username availability
export async function isUsernameAvailable(
  username: string,
  currentUserId?: string,
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase.from("profiles").select("id").eq("username", username);

  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data } = await query.single();
  return !data;
}
```

**Tasks**:

- [ ] Create API functions file
- [ ] Implement profile queries
- [ ] Add error handling
- [ ] Write unit tests for API functions

### 2.3 Create Favorites API

**File**: `lib/api/favorites.ts`

```typescript
import { createClient } from "@/lib/supabase/server";
import { Favorite } from "@/lib/types/profile.types";

export async function addToFavorites(
  userId: string,
  itemType: "monster" | "spell",
  itemId: string,
): Promise<Favorite> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, item_type: itemType, item_id: itemId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromFavorites(favoriteId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId);

  if (error) throw error;
}

export async function getFavoriteId(
  userId: string,
  itemType: "monster" | "spell",
  itemId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .single();

  return data?.id || null;
}
```

**Tasks**:

- [ ] Create favorites API functions
- [ ] Handle unique constraint errors gracefully
- [ ] Add error handling and validation

---

## Phase 3: Settings Page

### 3.1 Create Validation Schemas

**File**: `app/settings/schemas.ts`

```typescript
import { z } from "zod";

export const ProfileSettingsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    )
    .regex(/^[a-zA-Z0-9]/, "Username must start with a letter or number")
    .regex(/[a-zA-Z0-9]$/, "Username must end with a letter or number"),

  display_name: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional()
    .or(z.literal("")),

  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileSettingsFormData = z.infer<typeof ProfileSettingsSchema>;
```

**Tasks**:

- [ ] Create validation schemas
- [ ] Test edge cases (special characters, length limits)
- [ ] Add custom error messages

### 3.2 Create Server Actions

**File**: `app/actions/profile.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUsernameAvailable } from "@/lib/api/profiles";
import { ProfileSettingsSchema } from "@/app/settings/schemas";

export async function updateUserProfile(formData: {
  username: string;
  display_name?: string;
  bio?: string;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  // Validate input
  const result = ProfileSettingsSchema.safeParse(formData);
  if (!result.success) {
    return { error: "Validation error", details: result.error.issues };
  }

  // Check username availability
  const available = await isUsernameAvailable(result.data.username, user.id);
  if (!available) {
    return { error: "Username already taken" };
  }

  // Update profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      username: result.data.username,
      display_name: result.data.display_name || null,
      bio: result.data.bio || null,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Failed to update profile" };
  }

  // Revalidate pages
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/users/${profile.username_slug}`);

  return { success: true, profile };
}

export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Failed to update avatar" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/users/${profile.username_slug}`);

  return { success: true, profile };
}
```

**Tasks**:

- [ ] Create server actions file
- [ ] Implement profile update logic
- [ ] Add proper error handling
- [ ] Test revalidation paths

### 3.3 Create Avatar Upload Component

**File**: `components/settings/AvatarUpload.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Avatar, FileButton, Button, Text, Group, Stack } from '@mantine/core'
import { Camera, Trash } from 'lucide-react'
import { updateUserAvatar } from '@/app/actions/profile'
import { notifications } from '@mantine/notifications'

interface AvatarUploadProps {
  currentUrl?: string
  userId: string
}

export function AvatarUpload({ currentUrl, userId }: AvatarUploadProps) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentUrl)

  const handleUpload = async (file: File | null) => {
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'Error',
        message: 'File size must be less than 5MB',
        color: 'red',
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      notifications.show({
        title: 'Error',
        message: 'File must be an image',
        color: 'red',
      })
      return
    }

    setLoading(true)

    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!)
      formData.append('folder', `shadowdark/avatars/${userId}`)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )

      const data = await response.json()

      // Update profile
      const result = await updateUserAvatar(data.secure_url)

      if (result.error) {
        throw new Error(result.error)
      }

      setPreviewUrl(data.secure_url)
      notifications.show({
        title: 'Success',
        message: 'Avatar updated successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload avatar',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      const result = await updateUserAvatar('')
      if (result.error) throw new Error(result.error)

      setPreviewUrl(undefined)
      notifications.show({
        title: 'Success',
        message: 'Avatar removed',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove avatar',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack gap="md">
      <Avatar src={previewUrl} size={120} radius="xl" />

      <Group gap="sm">
        <FileButton onChange={handleUpload} accept="image/*" disabled={loading}>
          {(props) => (
            <Button {...props} leftSection={<Camera size={16} />} loading={loading}>
              Upload Photo
            </Button>
          )}
        </FileButton>

        {previewUrl && (
          <Button
            variant="outline"
            color="red"
            leftSection={<Trash size={16} />}
            onClick={handleRemove}
            loading={loading}
          >
            Remove
          </Button>
        )}
      </Group>

      <Text size="sm" c="dimmed">
        Max 5MB. Formats: JPG, PNG, GIF, WEBP
      </Text>
    </Stack>
  )
}
```

**Tasks**:

- [ ] Create AvatarUpload component
- [ ] Implement Cloudinary integration
- [ ] Add file validation (size, type)
- [ ] Add loading states and error handling

### 3.4 Create Profile Settings Form

**File**: `components/settings/ProfileSettingsForm.tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextInput, Textarea, Button, Stack, Group, Text } from '@mantine/core'
import { ProfileSettingsSchema, type ProfileSettingsFormData } from '@/app/settings/schemas'
import { updateUserProfile } from '@/app/actions/profile'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'

interface ProfileSettingsFormProps {
  initialData: {
    username: string
    display_name?: string
    bio?: string
  }
}

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: initialData,
  })

  const bioLength = form.watch('bio')?.length || 0

  const onSubmit = async (data: ProfileSettingsFormData) => {
    setLoading(true)

    try {
      const result = await updateUserProfile(data)

      if (result.error) {
        notifications.show({
          title: 'Error',
          message: result.error,
          color: 'red',
        })
        return
      }

      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Something went wrong',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Username"
          description="This will be part of your profile URL"
          required
          {...form.register('username')}
          error={form.formState.errors.username?.message}
        />

        <TextInput
          label="Display Name"
          description="Your display name (optional)"
          {...form.register('display_name')}
          error={form.formState.errors.display_name?.message}
        />

        <div>
          <Textarea
            label="Bio"
            description="Tell us about yourself"
            rows={4}
            maxLength={500}
            {...form.register('bio')}
            error={form.formState.errors.bio?.message}
          />
          <Text size="sm" c="dimmed" ta="right" mt={4}>
            {bioLength}/500 characters
          </Text>
        </div>

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
```

**Tasks**:

- [ ] Create ProfileSettingsForm component
- [ ] Implement form with React Hook Form
- [ ] Add character counter for bio
- [ ] Add success/error notifications

### 3.5 Create Settings Page

**File**: `app/settings/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container, Title, Paper, Stack, Divider } from '@mantine/core'
import { AvatarUpload } from '@/components/settings/AvatarUpload'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Title order={1}>Settings</Title>

        <Paper p="md" withBorder>
          <Stack gap="lg">
            <Title order={2} size="h3">Profile Settings</Title>

            <div>
              <Title order={3} size="h4" mb="sm">Avatar</Title>
              <AvatarUpload
                currentUrl={profile.avatar_url || undefined}
                userId={user.id}
              />
            </div>

            <Divider />

            <ProfileSettingsForm
              initialData={{
                username: profile.username,
                display_name: profile.display_name || undefined,
                bio: profile.bio || undefined,
              }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
```

**Tasks**:

- [ ] Create settings page
- [ ] Add authentication check
- [ ] Fetch and display current profile
- [ ] Add breadcrumb navigation

---

## Phase 4: Dashboard Page

### 4.1 Create Dashboard Queries

**File**: `lib/api/dashboard.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function getUserMonsters(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_monsters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getUserSpells(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_spells")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getUserEncounterTables(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_encounter_tables")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getFavoriteMonsters(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(
      `
      *,
      monster:all_monsters(*)
    `,
    )
    .eq("user_id", userId)
    .eq("item_type", "monster")
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getFavoriteSpells(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(
      `
      *,
      spell:all_spells(*)
    `,
    )
    .eq("user_id", userId)
    .eq("item_type", "spell")
    .order("created_at", { ascending: false });

  return data || [];
}
```

**Tasks**:

- [ ] Create dashboard query functions
- [ ] Test queries with sample data
- [ ] Optimize with proper indexes

### 4.2 Create Quick Stats Component

**File**: `components/dashboard/QuickStats.tsx`

```typescript
import { Card, SimpleGrid, Text, Group } from '@mantine/core'
import { Swords, Sparkles, Dice6, Heart } from 'lucide-react'
import type { ProfileStats } from '@/lib/types/profile.types'

interface QuickStatsProps {
  stats: ProfileStats
}

const statItems = [
  { key: 'monstersCount', label: 'Monsters', icon: Swords, color: 'red' },
  { key: 'spellsCount', label: 'Spells', icon: Sparkles, color: 'blue' },
  { key: 'encounterTablesCount', label: 'Encounters', icon: Dice6, color: 'green' },
  { key: 'favoriteMonstersCount', label: 'Fav Monsters', icon: Heart, color: 'pink' },
  { key: 'favoriteSpellsCount', label: 'Fav Spells', icon: Heart, color: 'pink' },
]

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
      {statItems.map((item) => {
        const Icon = item.icon
        const count = stats[item.key as keyof ProfileStats]

        return (
          <Card key={item.key} p="md" withBorder>
            <Group gap="sm">
              <Icon size={24} className={`text-${item.color}-500`} />
              <div>
                <Text size="xl" fw={700}>{count}</Text>
                <Text size="sm" c="dimmed">{item.label}</Text>
              </div>
            </Group>
          </Card>
        )
      })}
    </SimpleGrid>
  )
}
```

**Tasks**:

- [ ] Create QuickStats component
- [ ] Add icons and styling
- [ ] Make stats clickable to jump to tabs

### 4.3 Create Dashboard Tabs Component

**File**: `components/dashboard/DashboardTabs.tsx`

```typescript
'use client'

import { Tabs } from '@mantine/core'
import { Swords, Sparkles, Dice6, Heart } from 'lucide-react'
import { useState } from 'react'
import type { DashboardTab } from '@/lib/types/profile.types'

interface DashboardTabsProps {
  initialTab?: DashboardTab
  monstersContent: React.ReactNode
  spellsContent: React.ReactNode
  encountersContent: React.ReactNode
  favMonstersContent: React.ReactNode
  favSpellsContent: React.ReactNode
}

export function DashboardTabs({
  initialTab = 'monsters',
  monstersContent,
  spellsContent,
  encountersContent,
  favMonstersContent,
  favSpellsContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab)

  return (
    <Tabs value={activeTab} onChange={(value) => setActiveTab(value as DashboardTab)}>
      <Tabs.List>
        <Tabs.Tab value="monsters" leftSection={<Swords size={16} />}>
          Monsters
        </Tabs.Tab>
        <Tabs.Tab value="spells" leftSection={<Sparkles size={16} />}>
          Spells
        </Tabs.Tab>
        <Tabs.Tab value="encounters" leftSection={<Dice6 size={16} />}>
          Encounters
        </Tabs.Tab>
        <Tabs.Tab value="favorite-monsters" leftSection={<Heart size={16} />}>
          Fav Monsters
        </Tabs.Tab>
        <Tabs.Tab value="favorite-spells" leftSection={<Heart size={16} />}>
          Fav Spells
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="monsters" pt="md">{monstersContent}</Tabs.Panel>
      <Tabs.Panel value="spells" pt="md">{spellsContent}</Tabs.Panel>
      <Tabs.Panel value="encounters" pt="md">{encountersContent}</Tabs.Panel>
      <Tabs.Panel value="favorite-monsters" pt="md">{favMonstersContent}</Tabs.Panel>
      <Tabs.Panel value="favorite-spells" pt="md">{favSpellsContent}</Tabs.Panel>
    </Tabs>
  )
}
```

**Tasks**:

- [ ] Create DashboardTabs component
- [ ] Add tab navigation with icons
- [ ] Support URL query params for deep linking

### 4.4 Create Content Cards Component

**File**: `components/dashboard/ContentCard.tsx`

```typescript
import { Card, Text, Badge, Group, Button, Menu } from '@mantine/core'
import { MoreVertical, Edit, Trash, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface ContentCardProps {
  title: string
  subtitle?: string
  isPublic?: boolean
  editUrl?: string
  onDelete?: () => void
  onTogglePublic?: () => void
}

export function ContentCard({
  title,
  subtitle,
  isPublic,
  editUrl,
  onDelete,
  onTogglePublic,
}: ContentCardProps) {
  return (
    <Card p="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={600}>{title}</Text>

        <Menu position="bottom-end">
          <Menu.Target>
            <Button variant="subtle" size="xs" px={4}>
              <MoreVertical size={16} />
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {editUrl && (
              <Menu.Item component={Link} href={editUrl} leftSection={<Edit size={16} />}>
                Edit
              </Menu.Item>
            )}

            {onTogglePublic && (
              <Menu.Item
                leftSection={isPublic ? <EyeOff size={16} /> : <Eye size={16} />}
                onClick={onTogglePublic}
              >
                Make {isPublic ? 'Private' : 'Public'}
              </Menu.Item>
            )}

            {onDelete && (
              <Menu.Item color="red" leftSection={<Trash size={16} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>

      {subtitle && (
        <Text size="sm" c="dimmed" mb="xs">
          {subtitle}
        </Text>
      )}

      {isPublic !== undefined && (
        <Badge variant={isPublic ? 'filled' : 'outline'} color={isPublic ? 'green' : 'gray'}>
          {isPublic ? 'Public' : 'Private'}
        </Badge>
      )}
    </Card>
  )
}
```

**Tasks**:

- [ ] Create ContentCard component
- [ ] Add action menu (edit, delete, toggle public)
- [ ] Add confirmation dialogs for destructive actions

### 4.5 Create Dashboard Page

**File**: `app/dashboard/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container, Title, Stack, Button } from '@mantine/core'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { getProfileStats } from '@/lib/api/profiles'
import {
  getUserMonsters,
  getUserSpells,
  getUserEncounterTables,
  getFavoriteMonsters,
  getFavoriteSpells,
} from '@/lib/api/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/auth/login')
  }

  // Fetch all data in parallel
  const [stats, monsters, spells, encounters, favMonsters, favSpells] = await Promise.all([
    getProfileStats(user.id),
    getUserMonsters(user.id),
    getUserSpells(user.id),
    getUserEncounterTables(user.id),
    getFavoriteMonsters(user.id),
    getFavoriteSpells(user.id),
  ])

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div className="flex justify-between items-center">
          <Title order={1}>My Dashboard</Title>
          <Button component={Link} href="/settings" leftSection={<Settings size={16} />}>
            Settings
          </Button>
        </div>

        <QuickStats stats={stats} />

        <DashboardTabs
          monstersContent={<div>Monsters: {monsters.length}</div>}
          spellsContent={<div>Spells: {spells.length}</div>}
          encountersContent={<div>Encounters: {encounters.length}</div>}
          favMonstersContent={<div>Fav Monsters: {favMonsters.length}</div>}
          favSpellsContent={<div>Fav Spells: {favSpells.length}</div>}
        />
      </Stack>
    </Container>
  )
}
```

**Tasks**:

- [ ] Create dashboard page
- [ ] Fetch user data
- [ ] Render stats and tabs
- [ ] Add empty states for each tab

---

## Phase 5: Public Profile Page

### 5.1 Create Profile Header Component

**File**: `components/profile/ProfileHeader.tsx`

```typescript
import { Avatar, Text, Stack, Group, Badge } from '@mantine/core'
import { Calendar } from 'lucide-react'
import type { Profile } from '@/lib/types/profile.types'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <Stack gap="md" align="center" py="xl">
      <Avatar src={profile.avatar_url} size={120} radius="xl" />

      <div className="text-center">
        <Text size="xl" fw={700}>
          {profile.display_name || profile.username}
        </Text>

        <Group gap="xs" justify="center" mt={4}>
          <Calendar size={14} />
          <Text size="sm" c="dimmed">
            Joined {joinDate}
          </Text>
        </Group>
      </div>

      {profile.bio && (
        <Text size="sm" ta="center" maw={600}>
          {profile.bio}
        </Text>
      )}
    </Stack>
  )
}
```

**Tasks**:

- [ ] Create ProfileHeader component
- [ ] Display avatar, username, bio
- [ ] Add join date

### 5.2 Create Profile Stats Component

**File**: `components/profile/ProfileStats.tsx`

```typescript
import { Card, SimpleGrid, Text, Group } from '@mantine/core'
import { Swords, Sparkles, Dice6 } from 'lucide-react'
import type { ProfileStats } from '@/lib/types/profile.types'

interface ProfileStatsProps {
  stats: ProfileStats
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const items = [
    { label: 'Monsters', count: stats.monstersCount, icon: Swords },
    { label: 'Spells', count: stats.spellsCount, icon: Sparkles },
    { label: 'Encounters', count: stats.encounterTablesCount, icon: Dice6 },
  ]

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} p="md" withBorder>
            <Group gap="sm">
              <Icon size={24} />
              <div>
                <Text size="xl" fw={700}>{item.count}</Text>
                <Text size="sm" c="dimmed">{item.label}</Text>
              </div>
            </Group>
          </Card>
        )
      })}
    </SimpleGrid>
  )
}
```

**Tasks**:

- [ ] Create ProfileStats component
- [ ] Display public content counts only

### 5.3 Create Public Profile Page

**File**: `app/users/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { Container, Title, Stack, Tabs } from '@mantine/core'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { getProfileBySlug } from '@/lib/api/profiles'
import { Swords, Sparkles, Dice6 } from 'lucide-react'

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { slug } = await params
  const profile = await getProfileBySlug(slug)

  if (!profile) return {}

  return {
    title: `${profile.username} | Shadowdark Tools`,
    description: profile.bio || `View ${profile.username}'s custom Shadowdark content`,
    openGraph: {
      title: profile.display_name || profile.username,
      description: profile.bio,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { slug } = await params
  const profile = await getProfileBySlug(slug)

  if (!profile) {
    notFound()
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <ProfileHeader profile={profile} />
        <ProfileStats stats={profile.stats} />

        <Tabs defaultValue="monsters">
          <Tabs.List>
            <Tabs.Tab value="monsters" leftSection={<Swords size={16} />}>
              Monsters ({profile.stats.monstersCount})
            </Tabs.Tab>
            <Tabs.Tab value="spells" leftSection={<Sparkles size={16} />}>
              Spells ({profile.stats.spellsCount})
            </Tabs.Tab>
            <Tabs.Tab value="encounters" leftSection={<Dice6 size={16} />}>
              Encounters ({profile.stats.encounterTablesCount})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="monsters" pt="md">
            <div>Public monsters will be listed here</div>
          </Tabs.Panel>
          <Tabs.Panel value="spells" pt="md">
            <div>Public spells will be listed here</div>
          </Tabs.Panel>
          <Tabs.Panel value="encounters" pt="md">
            <div>Public encounters will be listed here</div>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
```

**Tasks**:

- [ ] Create public profile page
- [ ] Add dynamic route with slug
- [ ] Add SEO metadata
- [ ] Create 404 page for invalid usernames

---

## Phase 6: Favorites System

### 6.1 Create Favorite Button Component

**File**: `components/favorites/FavoriteButton.tsx`

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@mantine/core'
import { Heart } from 'lucide-react'
import { notifications } from '@mantine/notifications'
import { toggleFavorite } from '@/app/actions/favorites'

interface FavoriteButtonProps {
  itemId: string
  itemType: 'monster' | 'spell'
  initialFavoriteId?: string
  compact?: boolean
}

export function FavoriteButton({
  itemId,
  itemType,
  initialFavoriteId,
  compact = false,
}: FavoriteButtonProps) {
  const [favoriteId, setFavoriteId] = useState(initialFavoriteId)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleFavorite(itemType, itemId, favoriteId)

        if (result.error) {
          notifications.show({
            title: 'Error',
            message: result.error,
            color: 'red',
          })
          return
        }

        setFavoriteId(result.favoriteId || undefined)

        notifications.show({
          title: 'Success',
          message: result.favoriteId ? 'Added to favorites' : 'Removed from favorites',
          color: 'green',
        })
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Something went wrong',
          color: 'red',
        })
      }
    })
  }

  const isFavorited = !!favoriteId

  return (
    <Button
      variant={compact ? 'subtle' : 'outline'}
      size={compact ? 'xs' : 'sm'}
      onClick={handleToggle}
      loading={isPending}
      leftSection={
        <Heart
          size={16}
          fill={isFavorited ? 'currentColor' : 'none'}
          className={isFavorited ? 'text-red-500' : ''}
        />
      }
    >
      {!compact && (isFavorited ? 'Favorited' : 'Favorite')}
    </Button>
  )
}
```

**Tasks**:

- [ ] Create FavoriteButton component
- [ ] Add optimistic UI updates
- [ ] Handle authentication requirement

### 6.2 Create Favorites Server Action

**File**: `app/actions/favorites.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteId,
} from "@/lib/api/favorites";

export async function toggleFavorite(
  itemType: "monster" | "spell",
  itemId: string,
  currentFavoriteId?: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  try {
    if (currentFavoriteId) {
      // Remove from favorites
      await removeFromFavorites(currentFavoriteId);
      revalidatePath("/dashboard");
      return { favoriteId: null };
    } else {
      // Add to favorites
      const favorite = await addToFavorites(user.id, itemType, itemId);
      revalidatePath("/dashboard");
      return { favoriteId: favorite.id };
    }
  } catch (error) {
    return { error: "Failed to update favorites" };
  }
}
```

**Tasks**:

- [ ] Create toggleFavorite server action
- [ ] Add revalidation for dashboard
- [ ] Handle errors gracefully

---

## Phase 7: Polish & Testing

### 7.1 Add Loading States

**Tasks**:

- [ ] Add skeleton loaders for profile page
- [ ] Add loading states for dashboard tabs
- [ ] Add loading overlay for settings form
- [ ] Add suspense boundaries

### 7.2 Error Handling

**Tasks**:

- [ ] Create error.tsx for each route
- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add retry mechanisms

### 7.3 Responsive Design

**Tasks**:

- [ ] Test on mobile devices
- [ ] Optimize tab navigation for mobile
- [ ] Ensure forms are mobile-friendly
- [ ] Test avatar upload on mobile

### 7.4 Testing

**Tasks**:

- [ ] Write E2E tests for profile creation (Playwright)
- [ ] Write E2E tests for settings update
- [ ] Write E2E tests for favorites system
- [ ] Write unit tests for API functions
- [ ] Write unit tests for validation schemas

### 7.5 Performance

**Tasks**:

- [ ] Add proper indexes to database
- [ ] Optimize image loading (Cloudinary transformations)
- [ ] Add caching headers
- [ ] Optimize bundle size

---

## Environment Variables

Add to `.env.local`:

```bash
# Cloudinary (for avatar uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=your_upload_preset
```

---

## Acceptance Criteria

- [ ] Users can create and edit their profile (username, display name, bio, avatar)
- [ ] Usernames are unique and validated
- [ ] Avatar upload works with proper file validation
- [ ] Dashboard shows all user content (public + private)
- [ ] Dashboard displays accurate stats
- [ ] Public profiles are accessible via username slug
- [ ] Public profiles show only public content
- [ ] Users can favorite monsters and spells
- [ ] Favorites appear in dashboard tabs
- [ ] All pages are mobile-responsive
- [ ] RLS policies prevent unauthorized access
- [ ] SEO metadata is properly configured for public profiles
- [ ] All forms have proper validation and error handling

---

## Success Metrics

- Profile creation success rate > 95%
- Avatar upload success rate > 90%
- Page load time < 2s for dashboard
- Page load time < 1.5s for public profile
- Zero RLS policy violations in production
- Mobile usability score > 85/100

---

## Notes

- Profile creation happens automatically on user signup
- Username slugs are auto-generated and updated via database trigger
- Cloudinary handles image resizing and optimization
- RLS policies ensure data security at database level
- All mutations use Server Actions for type safety
- Public profiles are SEO-friendly with proper metadata
