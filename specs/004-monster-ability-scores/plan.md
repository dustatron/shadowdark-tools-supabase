# Implementation Plan: Monster Ability Score Modifiers

**Feature**: Display ability score modifiers on monster detail pages
**Branch**: `monster-stats`
**Estimate**: 1.5-2 hours

---

## Overview

Add 6 ability score modifier fields to monsters, populate official monsters, display in UI.

---

## Tasks

### 1. Database Migration (15 min)

**File**: `supabase/migrations/YYYYMMDDHHMMSS_add_ability_modifiers.sql`

```sql
-- Add columns to official_monsters
ALTER TABLE official_monsters
  ADD COLUMN strength_mod INTEGER DEFAULT 0 CHECK (strength_mod >= -5 AND strength_mod <= 5),
  ADD COLUMN dexterity_mod INTEGER DEFAULT 0 CHECK (dexterity_mod >= -5 AND dexterity_mod <= 5),
  ADD COLUMN constitution_mod INTEGER DEFAULT 0 CHECK (constitution_mod >= -5 AND constitution_mod <= 5),
  ADD COLUMN intelligence_mod INTEGER DEFAULT 0 CHECK (intelligence_mod >= -5 AND intelligence_mod <= 5),
  ADD COLUMN wisdom_mod INTEGER DEFAULT 0 CHECK (wisdom_mod >= -5 AND wisdom_mod <= 5),
  ADD COLUMN charisma_mod INTEGER DEFAULT 0 CHECK (charisma_mod >= -5 AND charisma_mod <= 5);

-- Add columns to user_monsters
ALTER TABLE user_monsters
  ADD COLUMN strength_mod INTEGER DEFAULT 0 CHECK (strength_mod >= -5 AND strength_mod <= 5),
  ADD COLUMN dexterity_mod INTEGER DEFAULT 0 CHECK (dexterity_mod >= -5 AND dexterity_mod <= 5),
  ADD COLUMN constitution_mod INTEGER DEFAULT 0 CHECK (constitution_mod >= -5 AND constitution_mod <= 5),
  ADD COLUMN intelligence_mod INTEGER DEFAULT 0 CHECK (intelligence_mod >= -5 AND intelligence_mod <= 5),
  ADD COLUMN wisdom_mod INTEGER DEFAULT 0 CHECK (wisdom_mod >= -5 AND wisdom_mod <= 5),
  ADD COLUMN charisma_mod INTEGER DEFAULT 0 CHECK (charisma_mod >= -5 AND charisma_mod <= 5);

-- Recreate all_monsters view to include new columns
-- (copy existing view definition and add new columns)
```

### 2. Data Population (10 min)

**File**: `supabase/migrations/YYYYMMDDHHMMSS_populate_ability_modifiers.sql`

```sql
-- Update official monsters with modifiers based on challenge level
-- Simple formula: low CL monsters get negative mods, high CL get positive

UPDATE official_monsters
SET
  strength_mod = CASE
    WHEN challenge_level <= 2 THEN 0
    WHEN challenge_level <= 5 THEN 1
    WHEN challenge_level <= 8 THEN 2
    ELSE 3
  END,
  dexterity_mod = CASE
    WHEN challenge_level <= 2 THEN 0
    WHEN challenge_level <= 5 THEN 1
    WHEN challenge_level <= 8 THEN 2
    ELSE 3
  END,
  -- etc for other abilities
WHERE strength_mod = 0; -- Only update defaults

-- Note: Can refine per-monster later with specific data
```

### 3. TypeScript Types (10 min)

**File**: `app/monsters/[id]/MonsterDetailClient.tsx`

```typescript
interface Monster {
  // ... existing fields
  strength_mod?: number;
  dexterity_mod?: number;
  constitution_mod?: number;
  intelligence_mod?: number;
  wisdom_mod?: number;
  charisma_mod?: number;
}
```

**File**: `lib/validations/monster.ts`

```typescript
export const monsterSchema = z.object({
  // ... existing fields
  strength_mod: z.number().int().min(-5).max(5).default(0),
  dexterity_mod: z.number().int().min(-5).max(5).default(0),
  constitution_mod: z.number().int().min(-5).max(5).default(0),
  intelligence_mod: z.number().int().min(-5).max(5).default(0),
  wisdom_mod: z.number().int().min(-5).max(5).default(0),
  charisma_mod: z.number().int().min(-5).max(5).default(0),
});
```

### 4. UI Component (30 min)

**File**: `src/components/monsters/AbilityScoresCard.tsx`

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";

interface AbilityScoresCardProps {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export function AbilityScoresCard({
  strength = 0,
  dexterity = 0,
  constitution = 0,
  intelligence = 0,
  wisdom = 0,
  charisma = 0,
}: AbilityScoresCardProps) {
  const formatModifier = (mod: number) => {
    if (mod >= 0) return `+${mod}`;
    return `${mod}`;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ability Scores</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">STR</p>
            <p className="text-2xl font-bold">{formatModifier(strength)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">DEX</p>
            <p className="text-2xl font-bold">{formatModifier(dexterity)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">CON</p>
            <p className="text-2xl font-bold">{formatModifier(constitution)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">INT</p>
            <p className="text-2xl font-bold">{formatModifier(intelligence)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">WIS</p>
            <p className="text-2xl font-bold">{formatModifier(wisdom)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">CHA</p>
            <p className="text-2xl font-bold">{formatModifier(charisma)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**File**: `app/monsters/[id]/MonsterDetailClient.tsx`

```tsx
// Add import
import { AbilityScoresCard } from "@/src/components/monsters/AbilityScoresCard";

// Add component after MonsterStatBlock (line ~338)
<AbilityScoresCard
  strength={monster.strength_mod}
  dexterity={monster.dexterity_mod}
  constitution={monster.constitution_mod}
  intelligence={monster.intelligence_mod}
  wisdom={monster.wisdom_mod}
  charisma={monster.charisma_mod}
/>;
```

### 5. API Updates (10 min)

**File**: `app/monsters/[id]/page.tsx`

```typescript
// Update SELECT query (line 30-48)
const { data: monster, error } = await supabase
  .from("all_monsters")
  .select(
    `
    id,
    name,
    // ... existing fields
    strength_mod,
    dexterity_mod,
    constitution_mod,
    intelligence_mod,
    wisdom_mod,
    charisma_mod
  `,
  )
  .eq("id", monsterId)
  .single();
```

**File**: `app/api/monsters/route.ts` (POST)

- Add ability modifiers to insert payload
- Validate with updated schema

### 6. Forms (Optional - 20 min)

**File**: `app/monsters/create/page.tsx` & `app/monsters/[id]/edit/page.tsx`

- Add 6 number inputs for ability modifiers
- Range: -5 to +5
- Default: 0
- Group in grid layout

---

## Testing Checklist

- [ ] Migration runs without errors
- [ ] Official monsters have modifiers populated
- [ ] Detail page displays modifiers
- [ ] Modifiers format correctly (+0, +2, -1)
- [ ] Mobile layout: 3 columns
- [ ] Desktop layout: 6 columns
- [ ] Form validation: -5 to +5 range
- [ ] API returns modifier fields
- [ ] Defaults to +0 for missing data

---

## Files to Modify

1. `supabase/migrations/` - 2 new files
2. `src/components/monsters/AbilityScoresCard.tsx` - create
3. `app/monsters/[id]/MonsterDetailClient.tsx` - update
4. `app/monsters/[id]/page.tsx` - update query
5. `lib/validations/monster.ts` - update schema
6. `app/api/monsters/route.ts` - update (optional)
7. `app/monsters/create/page.tsx` - update (optional)
8. `app/monsters/[id]/edit/page.tsx` - update (optional)

---

## Deployment Notes

- Run migrations on local first
- Verify data populated correctly
- Test detail page rendering
- Deploy to staging
- Production deploy after validation

---

**Time Breakdown**

- Database: 25 min
- Types: 10 min
- UI: 30 min
- API: 10 min
- Forms: 20 min (optional)
- Testing: 15 min

**Total: 1.5-2 hours**
