# Feature Plan: Auto-Generated Encounter Table Names

**Status:** Planning
**Created:** 2025-10-29
**Feature Type:** UX Enhancement

---

## Overview

Auto-generate creative, Shadowdark-themed names for encounter tables when users visit the "New Encounter Table" page. Users can regenerate names with a button click while retaining manual editing capability.

---

## Requirements

### User Story

As a GM creating an encounter table, I want a random atmospheric name auto-generated so I can quickly create tables without thinking of names.

### Format Specification

- **Pattern:** `[Location] of [Noun]`
- **Examples:**
  - "Crypt of Shadows"
  - "Temple of Dread"
  - "Caverns of Doom"
  - "Halls of Blood"

### Behavior

1. **On page load:** Auto-generate random name, populate form field
2. **Regenerate button:** Click to generate new random name
3. **Manual editing:** User can edit/replace generated name
4. **No die size reference:** Name doesn't include table size (e.g., no "d20")

---

## Technical Design

### Architecture

**Implementation Approach:** Client-side utility function with extensive word banks

**Why not server-side/API?**

- No need for persistence or complex logic
- Instant generation, no latency
- No backend resources required

**Why not AI/LLM?**

- Overkill for simple pattern matching
- Cost and latency unnecessary
- Static word banks provide consistent quality

---

## Word Banks (Shadowdark-Reviewed)

### LOCATIONS (60 words)

Places adventurers explore. Dark fantasy, OSR, dungeon crawl themed.

```
Crypt, Temple, Tomb, Caverns, Ruins, Tower, Keep, Dungeon, Depths, Halls,
Vault, Sanctum, Catacombs, Labyrinth, Warren, Lair, Den, Grove, Marsh, Barrow,
Citadel, Fortress, Monastery, Abbey, Chapel, Shrine, Catacomb, Ossuary, Mines,
Pit, Chasm, Abyss, Grotto, Chamber, Passages, Tunnels, Gates, Threshold, Spire,
Pinnacle, Necropolis, Mausoleum, Sepulcher, Charnel House, Oubliette, Undercroft,
Cairn, Dolmen, Crypts, Cistern, Cloister, Reliquary, Archive, Repository, Hollow,
Chantry, Foundry, Warrens, Stronghold, Redoubt
```

### NOUNS (65 words)

Dark, ominous themes. Evocative imagery fitting Shadowdark's deadly tone.

```
Shadows, Dread, Doom, Despair, Souls, Dead, Night, Blood, Bones, Darkness,
Terror, Madness, Woe, Peril, Ruin, Death, Curses, Screams, Whispers, Agony,
Torment, Sorrow, Nightmares, Decay, Rot, Plague, Ash, Embers, Frost, Suffering,
Anguish, Horror, Chaos, Oblivion, Void, Fangs, Claws, Chains, Iron, Stone, Flame,
Venom, Blight, Wyrms, Serpents, Ravens, Crows, Vipers, Vermin, Spectres, Wraiths,
Ghouls, Revenants, Corpses, Carrion, Tombs, Crimson, Scarlet, Midnight, Dusk,
Eclipse, Winter, Famine, Pestilence, Thorns, Briars, Weeping, Moaning, Wailing,
Unrest
```

**Source:** Reviewed and expanded by shadowdark-specialist agent

**Tone Guidelines:**

- Classic D&D/OSR aesthetic (e.g., Keep on the Borderlands, Tomb of Horrors)
- Dark fantasy, deadly-but-fair
- No modern fantasy or sci-fi terms
- Mix of single words and short phrases

---

## Implementation Details

### 1. Create Utility Function

**File:** `lib/encounter-tables/utils/generate-name.ts`

**Function Signature:**

```typescript
export function generateEncounterTableName(): string;
```

**Logic:**

1. Pick random location from LOCATIONS array
2. Pick random noun from NOUNS array
3. Return formatted string: `${location} of ${noun}`

**Additional Features (Optional):**

- 10% chance to prefix with "The" (e.g., "The Crypt of Shadows")
- Validation to avoid awkward combos (e.g., "Tombs of Tombs")
- Weighted selection (common words appear more often)

**Example Implementation:**

```typescript
const LOCATIONS = [
  "Crypt",
  "Temple",
  "Tomb", // ... (60 total)
];

const NOUNS = [
  "Shadows",
  "Dread",
  "Doom", // ... (65 total)
];

export function generateEncounterTableName(): string {
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${location} of ${noun}`;
}
```

---

### 2. Update EncounterForm Component

**File:** `app/encounter-tables/new/EncounterForm.tsx`

**Changes:**

1. **Import utility:**

   ```typescript
   import { generateEncounterTableName } from "@/lib/encounter-tables/utils/generate-name";
   ```

2. **Generate on mount:**

   ```typescript
   useEffect(() => {
     form.setValue("name", generateEncounterTableName());
   }, []);
   ```

3. **Add regenerate button:**
   - Position: Inline with "Table Name" label
   - Icon: Refresh/dice icon (lucide-react `RefreshCw` or `Dices`)
   - Tooltip: "Generate random name"
   - Handler: `onClick={() => form.setValue("name", generateEncounterTableName())}`

4. **UI Layout:**
   ```tsx
   <FormItem>
     <div className="flex items-center justify-between">
       <FormLabel>Table Name</FormLabel>
       <Button
         type="button"
         variant="ghost"
         size="sm"
         onClick={() => form.setValue("name", generateEncounterTableName())}
       >
         <RefreshCw className="h-4 w-4" />
       </Button>
     </div>
     <FormControl>
       <Input placeholder="e.g., Forest Encounters" {...field} />
     </FormControl>
     <FormMessage />
   </FormItem>
   ```

---

## Files to Create/Modify

### Create

1. `lib/encounter-tables/utils/generate-name.ts` - Name generator utility
2. `specs/005-encounter-name-generator/plan.md` - This file

### Modify

1. `app/encounter-tables/new/EncounterForm.tsx` - Integrate generator

---

## Testing Plan

### Manual Testing

1. Navigate to `/encounter-tables/new`
2. Verify name field auto-populated with generated name
3. Click regenerate button multiple times
4. Verify each click generates new name
5. Manually edit name field, verify user input preserved
6. Submit form with generated name, verify table created

### Edge Cases

- Empty word banks (shouldn't happen with static arrays)
- Same word combo (e.g., "Tombs of Tombs") - acceptable or filter?
- Very long combinations - all current words fit in UI

---

## Future Enhancements (Out of Scope)

1. **Weighted selection** - Common words appear more frequently
2. **"The" prefix** - Occasionally add definite article
3. **User preferences** - Save favorite naming patterns
4. **Custom word banks** - Let users add their own words
5. **Multi-pattern support** - Alternative formats beyond "[Location] of [Noun]"
6. **Theme filters** - Toggle word banks (undead, beasts, elemental, etc.)

---

## Shadowdark Agent Feedback

**Review Date:** 2025-10-29

**Key Recommendations:**

1. ✅ Expanded word banks to 60+ locations, 65+ nouns
2. ✅ Removed verbose phrases ("Lost Souls" → "Souls")
3. ✅ All words fit Shadowdark OSR tone
4. 💡 Consider optional "The" prefix (10% chance)
5. 💡 Consider avoiding same-word combos
6. 💡 Consider weighted distribution for variety

**Tone Validation:**
All words match Shadowdark's deadly-but-fair OSR aesthetic. Classic D&D dungeon crawl vibes. Ready for implementation.

---

## Implementation Checklist

- [ ] Create `generate-name.ts` utility with word banks
- [ ] Write unit tests for generator function
- [ ] Update EncounterForm with useEffect for initial generation
- [ ] Add regenerate button with icon to form
- [ ] Manual testing (see Testing Plan)
- [ ] Optional: Add "The" prefix logic
- [ ] Optional: Add same-word validation

---

## Estimated Effort

**Total:** ~1 hour

- Create utility: 20 min
- Update form component: 20 min
- Testing/refinement: 20 min

**Complexity:** Low - straightforward feature, no backend changes needed.
