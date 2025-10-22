# Favorites Feature - Implementation Plan

## Overview

Implement a complete favorites system where logged-in users can favorite monsters and spells throughout the application. The favorite button will be integrated into all MonsterCard and SpellCard components, and favorited items will display in the user's dashboard.

## Goals

- Allow authenticated users to favorite/unfavorite monsters and spells
- Display favorite button on all monster/spell cards when user is logged in
- Show favorited items in dedicated dashboard tabs
- Provide seamless UX with optimistic updates and toast notifications
- Ensure database-level security via RLS policies

## Database Structure

The `favorites` table already exists with the following structure:

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('monster', 'spell')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);
```

**RLS Policies:**

- Users can view their own favorites
- Users can insert their own favorites
- Users can delete their own favorites

---

## Implementation Phases

### Phase 1: Migrate FavoriteButton to shadcn/ui ✅

**Status:** Partially Complete (needs migration from Mantine)

**Current State:**

- `components/favorites/FavoriteButton.tsx` exists but uses Mantine UI
- Uses `@mantine/notifications` for toasts
- Uses `@mantine/core` Button component

**Changes Required:**

1. **Replace Mantine Components**
   - Change from `import { Button } from "@mantine/core"` to `import { Button } from "@/components/ui/button"`
   - Remove `import { notifications } from "@mantine/notifications"`
   - Add `import { toast } from "sonner"`

2. **Update Notification Calls**

   ```typescript
   // Old (Mantine)
   notifications.show({
     title: "Error",
     message: result.error,
     color: "red",
   });

   // New (Sonner)
   toast.error(result.error);
   ```

3. **Update Button Props**
   - Keep `variant` and `size` props (compatible)
   - Remove `leftSection` prop
   - Wrap icon in button content instead

4. **Update Styling**
   - Replace Mantine class names with Tailwind utilities
   - Update Heart icon fill logic

**Files to Modify:**

- `components/favorites/FavoriteButton.tsx`

**Acceptance Criteria:**

- FavoriteButton uses only shadcn/ui components
- Toast notifications use Sonner
- Visual appearance matches existing shadcn/ui patterns
- No Mantine dependencies remain

---

### Phase 2: Integrate FavoriteButton into MonsterCard

**Status:** Placeholder exists, needs proper integration

**Current State:**

- `src/components/monsters/MonsterCard.tsx` has placeholder favorite button (lines 118-133)
- Props include `onToggleFavorite` and `isFavorited` callbacks
- Heart icon renders but doesn't properly fill when favorited

**Changes Required:**

1. **Update Props Interface**

   ```typescript
   interface MonsterCardProps {
     monster: Monster;
     currentUserId?: string;
     favoriteId?: string | null; // Add this
     onEdit?: (monster: Monster) => void;
     onDelete?: (monster: Monster) => void;
     // Remove onToggleFavorite and isFavorited
     showActions?: boolean;
     compact?: boolean;
   }
   ```

2. **Replace Placeholder Button**
   - Remove lines 118-133 (current Heart button implementation)
   - Import and use FavoriteButton component

   ```typescript
   import { FavoriteButton } from "@/components/favorites/FavoriteButton";
   ```

3. **Conditional Rendering**
   - Only render FavoriteButton when `currentUserId` is provided (user is logged in)
   - Pass `initialFavoriteId={favoriteId}` to FavoriteButton

4. **Position in Layout**
   - Keep in the same location (next to dropdown menu)
   - Ensure proper spacing with action buttons

**Files to Modify:**

- `src/components/monsters/MonsterCard.tsx`

**Acceptance Criteria:**

- FavoriteButton appears when user is logged in
- FavoriteButton hidden when user is logged out
- Favorite state persists correctly
- Toast notifications appear on favorite/unfavorite
- Heart fills red when favorited

---

### Phase 3: Add Favorite Functionality to SpellCard

**Status:** Not implemented

**Current State:**

- `src/components/spells/SpellCard.tsx` has no favorite functionality
- No action buttons or dropdown menu
- Card is simpler than MonsterCard

**Changes Required:**

1. **Update Props Interface**

   ```typescript
   interface SpellCardProps {
     spell: Spell;
     currentUserId?: string; // Add
     favoriteId?: string | null; // Add
     showActions?: boolean; // Add (default true)
   }
   ```

2. **Add Action Buttons Section**
   - Add similar header structure to MonsterCard
   - Include FavoriteButton and dropdown menu
   - Conditionally render based on `showActions` and `currentUserId`

3. **Import Required Components**

   ```typescript
   import { FavoriteButton } from "@/components/favorites/FavoriteButton";
   import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
   } from "@/components/ui/dropdown-menu";
   import { MoreVertical, Eye } from "lucide-react";
   ```

4. **Update Layout**
   - Modify CardHeader to include action buttons on the right
   - Keep existing spell info on the left
   - Maintain responsive design

**Files to Modify:**

- `src/components/spells/SpellCard.tsx`

**Acceptance Criteria:**

- SpellCard matches MonsterCard interaction patterns
- FavoriteButton appears when user is logged in
- Dropdown menu includes "View Details" link
- Layout remains clean and responsive
- Favorite functionality works correctly

---

### Phase 4: Update Monster & Spell List Pages

**Status:** Not implemented

**Current State:**

- List pages render cards without favorite state
- No user authentication check
- No favorite IDs fetched

**Changes Required:**

1. **Fetch Current User**

   ```typescript
   const supabase = await createClient();
   const {
     data: { user },
   } = await supabase.auth.getUser();
   ```

2. **Fetch User's Favorites**
   - Create helper function `getUserFavoriteIds(userId, itemType)`
   - Returns array of `{ item_id, favorite_id }` pairs
   - Convert to Map for O(1) lookup

3. **Create Favorites Lookup Map**

   ```typescript
   const favoritesMap = new Map(favorites.map((fav) => [fav.item_id, fav.id]));
   ```

4. **Pass Props to Cards**
   ```typescript
   <MonsterCard
     monster={monster}
     currentUserId={user?.id}
     favoriteId={favoritesMap.get(monster.id)}
   />
   ```

**Files to Check/Modify:**

- `app/monsters/page.tsx`
- `app/spells/page.tsx`
- `src/components/monsters/MonsterList.tsx` (if it exists)
- `src/components/spells/SpellList.tsx` (if it exists)

**Helper Functions to Create:**

- `lib/api/favorites.ts` - `getUserFavoriteIds(userId, itemType)`

**Acceptance Criteria:**

- List pages show favorite state for logged-in users
- Favorites persist across page refreshes
- Performance remains good (single query for all favorites)
- Logged-out users see cards without favorite buttons

---

### Phase 5: Update Monster & Spell Detail Pages

**Status:** Not implemented

**Current State:**

- Detail pages show full monster/spell information
- No favorite functionality
- No authentication check for favorite state

**Changes Required:**

1. **Fetch Current User and Favorite State**

   ```typescript
   const supabase = await createClient();
   const {
     data: { user },
   } = await supabase.auth.getUser();

   let favoriteId = null;
   if (user) {
     favoriteId = await getFavoriteId(user.id, "monster", monsterId);
   }
   ```

2. **Pass to Display Components**
   - If using MonsterCard/SpellCard on detail page, pass props
   - If using MonsterStatBlock or other components, add FavoriteButton

3. **Position FavoriteButton**
   - Add to header section of detail page
   - Near other action buttons (edit, delete)
   - Ensure good visual hierarchy

**Files to Check/Modify:**

- `app/monsters/[id]/page.tsx`
- `app/spells/[slug]/page.tsx`
- `src/components/monsters/MonsterStatBlock.tsx` (if used)
- `src/components/spells/SpellDetailBlock.tsx` (if used)

**Acceptance Criteria:**

- Detail pages show favorite button when logged in
- Favorite state loads correctly
- Button positioned prominently
- Toast notifications work on detail pages

---

### Phase 6: Update Dashboard to Display Favorite Items

**Status:** Basic structure exists, needs implementation

**Current State:**

- `app/dashboard/page.tsx` fetches favorites via `getFavoriteMonsters` and `getFavoriteSpells`
- Dashboard tabs show placeholder content: `<div>Fav Monsters: {favMonsters.length}</div>`
- API functions in `lib/api/dashboard.ts` already join with `all_monsters` and `all_spells` views

**Changes Required:**

1. **Create Favorite List Components**
   - Use existing MonsterCard and SpellCard components
   - Map over favorites data
   - Extract nested monster/spell data from join

2. **Update Dashboard Page**

   ```typescript
   <DashboardTabs
     favMonstersContent={
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {favMonsters.map((favorite) => (
           <MonsterCard
             key={favorite.id}
             monster={favorite.monster}
             currentUserId={user.id}
             favoriteId={favorite.id}
           />
         ))}
       </div>
     }
     favSpellsContent={
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {favSpells.map((favorite) => (
           <SpellCard
             key={favorite.id}
             spell={favorite.spell}
             currentUserId={user.id}
             favoriteId={favorite.id}
           />
         ))}
       </div>
     }
   />
   ```

3. **Add Empty States**
   - Show helpful message when no favorites exist
   - Include call-to-action to browse monsters/spells
   - Use shadcn/ui Alert or Card component

4. **Handle Data Structure**
   - Ensure joined data structure matches component expectations
   - Handle potential null values from joins
   - Filter out favorites where joined data is null

**Files to Modify:**

- `app/dashboard/page.tsx`

**Optional Components to Create:**

- `components/dashboard/EmptyFavorites.tsx` (reusable empty state)

**Acceptance Criteria:**

- Favorite monsters display with full details
- Favorite spells display with full details
- Unfavorite button works (removes from dashboard)
- Empty states show when no favorites exist
- Grid layout is responsive
- Quick stats update when favorites change

---

### Phase 7: Create Helper Utilities

**Status:** Partially complete

**Current State:**

- `lib/api/favorites.ts` has basic CRUD functions
- No bulk fetch utilities
- No helper functions for creating lookup maps

**Changes Required:**

1. **Add Bulk Fetch Function**

   ```typescript
   // lib/api/favorites.ts
   export async function getUserFavoriteIds(
     userId: string,
     itemType: "monster" | "spell",
   ): Promise<Array<{ item_id: string; favorite_id: string }>> {
     const supabase = await createClient();

     const { data, error } = await supabase
       .from("favorites")
       .select("id, item_id")
       .eq("user_id", userId)
       .eq("item_type", itemType);

     if (error) return [];

     return data.map((fav) => ({
       item_id: fav.item_id,
       favorite_id: fav.id,
     }));
   }
   ```

2. **Create Lookup Map Helper**

   ```typescript
   // lib/utils/favorites.ts
   export function createFavoritesMap(
     favorites: Array<{ item_id: string; favorite_id: string }>,
   ): Map<string, string> {
     return new Map(favorites.map((fav) => [fav.item_id, fav.favorite_id]));
   }
   ```

3. **Type Definitions**

   ```typescript
   // lib/types/favorites.types.ts (or add to profile.types.ts)
   export interface FavoriteWithMonster extends Favorite {
     monster: Monster | null;
   }

   export interface FavoriteWithSpell extends Favorite {
     spell: Spell | null;
   }
   ```

**Files to Create/Modify:**

- `lib/api/favorites.ts`
- `lib/utils/favorites.ts` (new)
- `lib/types/profile.types.ts` or `lib/types/favorites.types.ts`

**Acceptance Criteria:**

- Bulk fetch is efficient (single query)
- Lookup map provides O(1) access
- Type safety maintained throughout
- Functions are reusable across pages

---

### Phase 8: Testing & Polish

**Testing Checklist:**

**Functionality:**

- [ ] Favorite a monster from list page
- [ ] Unfavorite a monster from list page
- [ ] Favorite a monster from detail page
- [ ] Unfavorite a monster from detail page
- [ ] Favorite a spell from list page
- [ ] Unfavorite a spell from list page
- [ ] Favorite a spell from detail page
- [ ] Unfavorite a spell from detail page
- [ ] Unfavorite from dashboard (monsters tab)
- [ ] Unfavorite from dashboard (spells tab)
- [ ] Logged-out users don't see favorite buttons
- [ ] Multiple favorites work correctly
- [ ] Duplicate favorite attempts handled gracefully

**UI/UX:**

- [ ] Toast notifications appear on favorite
- [ ] Toast notifications appear on unfavorite
- [ ] Heart icon fills red when favorited
- [ ] Heart icon is outlined when not favorited
- [ ] Button loading state shows during API call
- [ ] Dashboard counts update after favorite/unfavorite
- [ ] Empty states display correctly
- [ ] Responsive layout on mobile
- [ ] Favorite button doesn't break card layout

**Performance:**

- [ ] List pages load quickly with favorites
- [ ] No N+1 query issues
- [ ] Optimistic UI updates feel snappy
- [ ] Revalidation doesn't cause jarring layout shifts

**Edge Cases:**

- [ ] Favoriting deleted item handled
- [ ] Network error during favorite shows error toast
- [ ] Rapid clicking doesn't create duplicates
- [ ] Session expiry during favorite handled
- [ ] RLS policies prevent unauthorized access

**Polish Items:**

- [ ] Consistent spacing around favorite buttons
- [ ] Proper z-index for dropdown menus
- [ ] Accessible aria-labels on buttons
- [ ] Keyboard navigation works
- [ ] Focus states are visible

---

## Technical Architecture

### Component Hierarchy

```
FavoriteButton (shared component)
├─ Used in MonsterCard
├─ Used in SpellCard
└─ Used in detail pages (optional)

MonsterCard
├─ Uses FavoriteButton (when currentUserId exists)
├─ Used in /monsters (list)
├─ Used in /monsters/[id] (detail)
└─ Used in /dashboard (favorites tab)

SpellCard
├─ Uses FavoriteButton (when currentUserId exists)
├─ Used in /spells (list)
├─ Used in /spells/[slug] (detail)
└─ Used in /dashboard (favorites tab)

Dashboard
├─ QuickStats (shows favorite counts)
├─ DashboardTabs
│   ├─ Monsters Tab
│   ├─ Spells Tab
│   ├─ Encounters Tab
│   ├─ Favorite Monsters Tab → renders MonsterCard[]
│   └─ Favorite Spells Tab → renders SpellCard[]
```

### Data Flow

1. **User clicks favorite button**
   - `FavoriteButton` calls `toggleFavorite` server action
   - Server action validates auth, calls API functions
   - Database updated via Supabase (RLS enforced)
   - Revalidates `/dashboard` path
   - Returns new favorite state

2. **Component receives result**
   - Local state updates (optimistic UI)
   - Toast notification displays
   - Dashboard auto-updates on next visit

3. **Page loads with favorites**
   - Server component fetches user
   - Fetches all favorite IDs for item type
   - Creates lookup map
   - Passes props to cards
   - Cards render with correct initial state

### Security

**RLS Policies (already configured):**

```sql
-- Users can only view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

**Server-Side Validation:**

- All favorite actions require authentication
- `toggleFavorite` server action checks `auth.uid()`
- Returns error if not authenticated

**Client-Side Guards:**

- FavoriteButton only renders when `currentUserId` provided
- Prevents unnecessary UI for logged-out users

---

## Database Views

The favorites system relies on two views that join user favorites with content:

**all_monsters view** (already exists):

- Unions official_monsters and user_monsters
- Used in `getFavoriteMonsters` join query

**all_spells view** (already exists):

- Unions official_spells and user_spells
- Used in `getFavoriteSpells` join query

These views ensure favorites work for both official and user-created content.

---

## File Structure

```
app/
├── actions/
│   └── favorites.ts                 ✅ Exists (server action)
├── dashboard/
│   └── page.tsx                     🔧 Needs update (display favorites)
├── monsters/
│   ├── page.tsx                     🔧 Needs update (fetch favorites)
│   └── [id]/
│       └── page.tsx                 🔧 Needs update (fetch favorite state)
└── spells/
    ├── page.tsx                     🔧 Needs update (fetch favorites)
    └── [slug]/
        └── page.tsx                 🔧 Needs update (fetch favorite state)

components/
├── dashboard/
│   ├── DashboardTabs.tsx           ✅ Exists
│   └── QuickStats.tsx              ✅ Exists
├── favorites/
│   └── FavoriteButton.tsx          🔧 Exists (needs shadcn migration)
└── ui/
    ├── button.tsx                   ✅ shadcn component
    ├── sonner.tsx                   ✅ Sonner toaster
    └── ...

src/components/
├── monsters/
│   └── MonsterCard.tsx             🔧 Needs update (integrate FavoriteButton)
└── spells/
    └── SpellCard.tsx               🔧 Needs update (add favorite functionality)

lib/
├── api/
│   ├── dashboard.ts                ✅ Exists (fetch favorites with joins)
│   ├── favorites.ts                🔧 Exists (needs bulk fetch function)
│   └── profiles.ts                 ✅ Exists
├── types/
│   └── profile.types.ts            🔧 Might need favorite types
└── utils/
    └── favorites.ts                ❌ New (helper utilities)

supabase/
└── migrations/
    └── 20251022121714_create_favorites.sql  ✅ Exists
```

**Legend:**

- ✅ Exists and ready
- 🔧 Exists but needs modification
- ❌ Needs to be created

---

## Success Metrics

**User Engagement:**

- Track favorite/unfavorite actions
- Monitor dashboard visits to favorites tabs
- Measure repeat usage of favorites

**Performance:**

- List pages load in < 2s (including favorites)
- Dashboard loads in < 2s
- Favorite/unfavorite completes in < 500ms

**Quality:**

- Zero RLS policy violations
- No N+1 query issues
- Error rate < 1% on favorite actions

---

## Future Enhancements (Out of Scope)

- **Favorite Collections**: Organize favorites into custom collections
- **Shared Favorites**: Share favorite lists with other users
- **Favorite Notifications**: Notify when favorited content is updated
- **Favorite Analytics**: Show which monsters/spells are most favorited
- **Export Favorites**: Download favorite lists as PDF/JSON
- **Favorite Limits**: Set max favorites for free users

---

## Questions & Decisions

**Q: Should favorites be public or private?**
**A:** Private. Only the user can see their own favorites (enforced by RLS).

**Q: Can users favorite other users' custom content?**
**A:** Yes, as long as the content is marked `is_public = true`.

**Q: What happens if a favorited item is deleted?**
**A:** Database handles via `ON DELETE CASCADE` - favorite is automatically removed.

**Q: Should we show favorite counts on items?**
**A:** Not in MVP. Could be added later for discovery.

**Q: Should favorites sync across devices?**
**A:** Yes, automatically via Supabase (tied to user account).

---

## Implementation Timeline

**Estimated Time:** 4-6 hours

- **Phase 1:** 30 min (migrate FavoriteButton)
- **Phase 2:** 30 min (integrate into MonsterCard)
- **Phase 3:** 45 min (add to SpellCard)
- **Phase 4:** 45 min (update list pages)
- **Phase 5:** 30 min (update detail pages)
- **Phase 6:** 1 hour (dashboard implementation)
- **Phase 7:** 30 min (helper utilities)
- **Phase 8:** 1-2 hours (testing & polish)

---

## Dependencies

- ✅ Database: `favorites` table exists with RLS
- ✅ Views: `all_monsters` and `all_spells` exist
- ✅ Auth: Supabase authentication working
- ✅ UI: shadcn/ui components installed
- ✅ Toast: Sonner configured in layout
- ✅ Server Actions: Next.js server actions enabled

---

## Notes

- Follow Next.js 15 patterns (async params, await createClient)
- Maintain consistency with existing shadcn/ui migration
- Keep mobile-first responsive design
- Ensure accessibility (aria-labels, keyboard nav)
- Use optimistic UI updates for better UX
- All favorites functionality behind authentication

---

**Last Updated:** 2025-10-22
**Status:** Planning Complete, Ready for Implementation
