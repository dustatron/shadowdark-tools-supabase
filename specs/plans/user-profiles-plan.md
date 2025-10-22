User Profile & Dashboard - Feature Specification

Overview

A comprehensive user profile system with three main pages:

Public Profile (/users/[username-slug]) - Read-only view of user’s public content

User Dashboard (/dashboard) - Personal hub for all user’s content (public + private)

Settings (/settings) - Edit profile information and preferences

Database Schema (Supabase)

Update auth.users metadata

-- Supabase Auth manages the core users table
-- We'll use user_metadata and app_metadata for custom fields
-- Or create a profiles table for better control

profiles table

CREATE TABLE profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
username TEXT UNIQUE NOT NULL,
username_slug TEXT UNIQUE NOT NULL, -- URL-friendly version
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

-- Function to generate username slug
CREATE OR REPLACE FUNCTION generate_username_slug(username TEXT)
RETURNS TEXT AS $$
BEGIN
RETURN lower(regexp_replace(
regexp_replace(username, '[^a-zA-Z0-9\s-]', '', 'g'),
'\s+', '-', 'g'
));
END;

$$
LANGUAGE plpgsql;

-- Trigger to auto-update username_slug when username changes
CREATE OR REPLACE FUNCTION update_username_slug()
RETURNS TRIGGER AS
$$

BEGIN
NEW.username_slug = generate_username_slug(NEW.username);
NEW.updated_at = NOW();
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_username_slug
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_username_slug();


favorites table

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


Update existing tables for created_by tracking

-- These should already have created_by from previous specs
-- Just ensuring they exist:

-- monsters table should have:
-- created_by UUID REFERENCES auth.users(id)
-- is_public BOOLEAN DEFAULT FALSE

-- spells table should have:
-- created_by UUID REFERENCES auth.users(id)
-- is_public BOOLEAN DEFAULT FALSE

-- encounter_tables should have:
-- user_id UUID REFERENCES auth.users(id)
-- is_public BOOLEAN DEFAULT FALSE


TypeScript Types

// types/profile.ts

export interface Profile {
  id: string
  username: string
  username_slug: string
  display_name?: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface ProfileWithStats extends Profile {
  stats: {
    monstersCount: number
    spellsCount: number
    encounterTablesCount: number
    favoriteMonstersCount: number
    favoriteSpellsCount: number
  }
}

export interface Favorite {
  id: string
  user_id: string
  item_type: 'monster' | 'spell'
  item_id: string
  created_at: string
}

export interface FavoriteWithItem extends Favorite {
  item: Monster | Spell
}

export type DashboardTab =
  | 'monsters'
  | 'spells'
  | 'encounters'
  | 'favorite-monsters'
  | 'favorite-spells'


Pages & Routes

1. Public Profile (/users/[username-slug])

Purpose: Display user’s public content and profile information

Layout:

┌────────────────────────────────────────────────┐
│                                                │
│     ┌───────┐                                 │
│     │ Photo │  JohnTheDM                      │
│     └───────┘  Game Master since Nov 2024     │
│                                                │
│     "I love creating custom monsters and      │
│      running epic campaigns!"                 │
│                                                │
└────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Public Content                                  │
│                                                 │
│ ┌─────────────┬─────────────┬─────────────┐   │
│ │  Monsters   │   Spells    │  Encounters │   │
│ │     (12)    │     (8)     │     (5)     │   │
│ └─────────────┴─────────────┴─────────────┘   │
│                                                 │
│ [Currently showing: Monsters Tab]              │
│                                                 │
│ ┌──────────────┐ ┌──────────────┐             │
│ │ Fire Drake   │ │ Shadow Beast │             │
│ │ Level: 8     │ │ Level: 5     │             │
│ │ Custom       │ │ Custom       │             │
│ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────┘


Components:





Profile header with avatar, username, bio, join date



Stats bar showing counts



Tabbed interface for content:





Monsters (public custom monsters)



Spells (public custom spells)



Encounter Tables (public tables)



Content displayed as cards/grid



Empty states for tabs with no content

Features:





SEO-friendly URLs with username slugs



Responsive design (mobile-friendly)



Share profile link



404 page for non-existent usernames

2. User Dashboard (/dashboard)

Purpose: Personal hub for all user’s content (authenticated only)

Layout:

┌────────────────────────────────────────────────┐
│ My Dashboard                                   │
│                                    [Settings]  │
└────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Quick Stats                                     │
│                                                 │
│  📚 12 Monsters   ✨ 8 Spells   🎲 5 Encounters│
│  ❤️ 15 Favorite Monsters   ❤️ 10 Favorite Spells│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ┌──────────┬──────────┬────────────┬──────────┬──────────┐│
│ │ Monsters │  Spells  │ Encounters │ Fav      │ Fav      ││
│ │          │          │            │ Monsters │ Spells   ││
│ └──────────┴──────────┴────────────┴──────────┴──────────┘│
│                                                             │
│ [Currently showing: Monsters Tab]          [+ New Monster] │
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│ │ Fire Drake   │ │ Shadow Beast │ │ Goblin King  │       │
│ │ Level: 8     │ │ Level: 5     │ │ Level: 3     │       │
│ │ 🌍 Public    │ │ 🔒 Private   │ │ 🌍 Public    │       │
│ │ [Edit] [Del] │ │ [Edit] [Del] │ │ [Edit] [Del] │       │
│ └──────────────┘ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────────────────────────┘


Tabs:





Monsters - All custom monsters (public + private)



Spells - All custom spells (public + private)



Encounters - All encounter tables (public + private)



Favorite Monsters - Saved favorite monsters



Favorite Spells - Saved favorite spells

Features per tab:





Grid/list view toggle



Search and filter



Visibility indicator (public/private)



Quick actions (Edit, Delete, Toggle Public)



Create new button



Empty states with CTAs



Pagination for large lists

Quick Stats Section:





Total counts for each category



Visual cards/badges



Clickable to jump to relevant tab

3. Settings (/settings)

Purpose: Edit profile information and preferences

Layout:

┌────────────────────────────────────────────────┐
│ Settings                                       │
│                                    [< Back]    │
└────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Profile Settings                                │
│                                                 │
│ Avatar                                          │
│ ┌───────┐                                      │
│ │ Photo │  [Upload New Photo] [Remove]        │
│ └───────┘                                      │
│                                                 │
│ Username *                                      │
│ [john-the-dm____________]                      │
│ This will change your profile URL              │
│                                                 │
│ Display Name                                    │
│ [John Thompson__________]                      │
│                                                 │
│ Bio                                             │
│ [_______________________________]              │
│ [_______________________________]              │
│ [_______________________________]              │
│ 245/500 characters                              │
│                                                 │
│                        [Cancel]  [Save Changes]│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Account Settings                                │
│                                                 │
│ Email                                           │
│ [john@example.com_______]                      │
│                                                 │
│ Change Password                                 │
│ [Change Password]                               │
│                                                 │
│ Danger Zone                                     │
│ [Delete Account]                                │
└─────────────────────────────────────────────────┘


Sections:





Profile Settings:





Avatar upload/remove



Username (with validation)



Display name



Bio (500 char limit with counter)





Account Settings:





Email (managed by Supabase Auth)



Change password link



Delete account (with confirmation)

Validation:





Username: 3-30 characters, alphanumeric + hyphens/underscores



Username uniqueness check



Bio: Max 500 characters



Image upload: Max 5MB, image formats only

Components Structure

components/
  profile/
    ProfileHeader.tsx          // Avatar, username, bio display
    ProfileStats.tsx           // Stats bar with counts
    ProfileTabs.tsx            // Tabbed interface for content
    ContentGrid.tsx            // Reusable grid for monsters/spells/etc
    EmptyState.tsx             // Empty state with CTA

  dashboard/
    DashboardHeader.tsx        // Dashboard title and settings link
    QuickStats.tsx             // Stats cards section
    DashboardTabs.tsx          // Main tabs component
    ContentCard.tsx            // Card for monster/spell/encounter
    VisibilityBadge.tsx        // Public/Private indicator

  settings/
    ProfileSettingsForm.tsx    // Profile editing form
    AvatarUpload.tsx           // Image upload component
    UsernameInput.tsx          // Username with validation
    AccountSettings.tsx        // Email, password, delete account
    DeleteAccountDialog.tsx    // Confirmation modal


API/Database Queries

Profile Queries

// Get profile by username slug
export async function getProfileBySlug(
  slug: string
): Promise<ProfileWithStats | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username_slug', slug)
    .single()

  if (!profile) return null

  // Get stats
  const stats = await getProfileStats(profile.id)

  return { ...profile, stats }
}

// Get profile stats
async function getProfileStats(userId: string) {
  const [monsters, spells, encounters, favMonsters, favSpells] =
    await Promise.all([
      // Public monsters count
      supabase
        .from('monsters')
        .select('id', { count: 'exact' })
        .eq('created_by', userId)
        .eq('is_public', true),

      // Public spells count
      supabase
        .from('spells')
        .select('id', { count: 'exact' })
        .eq('created_by', userId)
        .eq('is_public', true),

      // Public encounter tables count
      supabase
        .from('encounter_tables')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_public', true),

      // Favorite monsters count
      supabase
        .from('favorites')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('item_type', 'monster'),

      // Favorite spells count
      supabase
        .from('favorites')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('item_type', 'spell')
    ])

  return {
    monstersCount: monsters.count || 0,
    spellsCount: spells.count || 0,
    encounterTablesCount: encounters.count || 0,
    favoriteMonstersCount: favMonsters.count || 0,
    favoriteSpellsCount: favSpells.count || 0
  }
}

// Get user's public content
export async function getPublicMonsters(userId: string) {
  const { data } = await supabase
    .from('monsters')
    .select('*')
    .eq('created_by', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getPublicSpells(userId: string) {
  const { data } = await supabase
    .from('spells')
    .select('*')
    .eq('created_by', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getPublicEncounterTables(userId: string) {
  const { data } = await supabase
    .from('encounter_tables')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return data || []
}


Dashboard Queries

// Get all user's monsters (public + private)
export async function getUserMonsters(userId: string) {
  const { data } = await supabase
    .from('monsters')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  return data || []
}

// Get all user's spells (public + private)
export async function getUserSpells(userId: string) {
  const { data } = await supabase
    .from('spells')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  return data || []
}

// Get all user's encounter tables (public + private)
export async function getUserEncounterTables(userId: string) {
  const { data } = await supabase
    .from('encounter_tables')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return data || []
}

// Get user's favorite monsters with full monster data
export async function getFavoriteMonsters(userId: string) {
  const { data } = await supabase
    .from('favorites')
    .select(`
      *,
      monster:monsters(*)
    `)
    .eq('user_id', userId)
    .eq('item_type', 'monster')
    .order('created_at', { ascending: false })

  return data || []
}

// Get user's favorite spells with full spell data
export async function getFavoriteSpells(userId: string) {
  const { data } = await supabase
    .from('favorites')
    .select(`
      *,
      spell:spells(*)
    `)
    .eq('user_id', userId)
    .eq('item_type', 'spell')
    .order('created_at', { ascending: false })

  return data || []
}


Favorites Mutations

// Add to favorites
export async function addToFavorites(
  userId: string,
  itemType: 'monster' | 'spell',
  itemId: string
) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Remove from favorites
export async function removeFromFavorites(favoriteId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', favoriteId)

  if (error) throw error
}

// Check if item is favorited
export async function isFavorited(
  userId: string,
  itemType: 'monster' | 'spell',
  itemId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .single()

  return !!data
}


Profile Mutations

// Update profile
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Check username availability
export async function isUsernameAvailable(
  username: string,
  currentUserId?: string
): Promise<boolean> {
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', username)

  // Exclude current user when checking
  if (currentUserId) {
    query = query.neq('id', currentUserId)
  }

  const { data } = await query.single()

  return !data
}

// Upload avatar to Cloudinary
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!)
  formData.append('folder', `shadowdark/avatars/${userId}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  const data = await response.json()
  return data.secure_url
}


Server Actions

// app/actions/profile.ts

'use server'

import { revalidatePath } from 'next/cache'

export async function updateUserProfile(
  userId: string,
  formData: {
    username: string
    display_name?: string
    bio?: string
  }
) {
  // Validate username
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  if (!usernameRegex.test(formData.username)) {
    return {
      error: 'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores'
    }
  }

  // Check availability
  const available = await isUsernameAvailable(formData.username, userId)
  if (!available) {
    return { error: 'Username already taken' }
  }

  // Update profile
  const profile = await updateProfile(userId, formData)

  // Revalidate pages
  revalidatePath('/dashboard')
  revalidatePath(`/users/${profile.username_slug}`)

  return { success: true, profile }
}

export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
) {
  const profile = await updateProfile(userId, { avatar_url: avatarUrl })

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  revalidatePath(`/users/${profile.username_slug}`)

  return { success: true, profile }
}


UI/UX Components

Avatar Component

interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  onUpload?: (file: File) => void
}

export function Avatar({ src, alt, size = 'md', editable, onUpload }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  return (
    <div className={`relative ${sizes[size]} rounded-full overflow-hidden`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-shadowdark-200 flex items-center justify-center">
          <User className="w-1/2 h-1/2 text-shadowdark-400" />
        </div>
      )}

      {editable && (
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition">
          <Camera className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload?.(e.target.files[0])}
          />
        </label>
      )}
    </div>
  )
}


Favorite Button Component

interface FavoriteButtonProps {
  itemId: string
  itemType: 'monster' | 'spell'
  initialFavorited?: boolean
}

export function FavoriteButton({
  itemId,
  itemType,
  initialFavorited = false
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)

    try {
      if (isFavorited) {
        await removeFromFavorites(/* favoriteId */)
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        await addToFavorites(userId, itemType, itemId)
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
    >
      <Heart
        className={isFavorited ? 'fill-red-500 text-red-500' : ''}
      />
    </Button>
  )
}


Visibility Badge Component

interface VisibilityBadgeProps {
  isPublic: boolean
}

export function VisibilityBadge({ isPublic }: VisibilityBadgeProps) {
  return (
    <Badge variant={isPublic ? 'default' : 'secondary'}>
      {isPublic ? (
        <>
          <Globe className="w-3 h-3 mr-1" />
          Public
        </>
      ) : (
        <>
          <Lock className="w-3 h-3 mr-1" />
          Private
        </>
      )}
    </Badge>
  )
}


Implementation Phases

Phase 1: Database & Auth Setup





 Create profiles table with RLS



 Create favorites table with RLS



 Update monsters, spells, encounter_tables with public flags



 Set up Cloudinary for image uploads



 Create profile on user signup (trigger/hook)

Phase 2: Settings Page





 Build settings page layout



 Avatar upload component (Cloudinary integration)



 Profile form with validation



 Username uniqueness check



 Bio character counter



 Save functionality with optimistic updates

Phase 3: User Dashboard





 Dashboard layout with tabs



 Quick stats section



 Content grids for each tab



 Visibility badges on content cards



 Empty states with CTAs



 Search and filter per tab

Phase 4: Public Profile





 Public profile page with slug routing



 Profile header component



 Public content tabs



 Content grids showing public items



 404 page for invalid usernames



 SEO meta tags

Phase 5: Favorites System





 Favorite button component



 Add/remove from favorites



 Favorite monsters tab



 Favorite spells tab



 Favorite indicators on content cards

Phase 6: Polish





 Loading states



 Error handling



 Mobile responsive design



 Profile link sharing



 Toast notifications



 Form validation feedback

Edge Cases & Validation

Username Validation





Length: 3-30 characters



Characters: alphanumeric, hyphens, underscores only



No spaces or special characters



Check uniqueness before saving



Cannot start/end with hyphen or underscore

Avatar Upload





File size limit: 5MB



Accepted formats: jpg, png, gif, webp



Automatic resizing via Cloudinary



Remove old avatar when uploading new one



Handle upload failures gracefully

Bio Validation





Max 500 characters



Trim whitespace



No HTML/script injection



Display character counter

Empty States





New users with no content



Tabs with no items



Failed data fetches



No search results

Error Handling





Username taken



Upload failed



Network errors



Invalid file type



File too large

Future Enhancements





Social Features: Follow users, activity feed



Badges/Achievements: Creator badges, milestone badges



Collections: Group content into collections



Comments: Allow comments on public content



Ratings: Star ratings on public monsters/spells



Export: Download all user content as JSON



Themes: Custom profile themes



Banner image: Profile banner in addition to avatar



Stats dashboard: Analytics on content views/favorites



Privacy settings: More granular privacy controls

SEO Considerations

Public Profile Meta Tags

export async function generateMetadata({ params }) {
  const profile = await getProfileBySlug(params.slug)

  if (!profile) return {}

  return {
    title: `${profile.username} | Shadowdark Tools`,
    description: profile.bio || `View ${profile.username}'s custom Shadowdark content`,
    openGraph: {
      title: profile.display_name || profile.username,
      description: profile.bio,
      images: [profile.avatar_url],
    }
  }
}


Canonical URLs





/users/[username-slug] - Canonical URL



Redirect from any old URLs if username changes
$$
