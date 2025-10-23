# Encounter

# Random Encounter Tables - Feature Specification

## Overview

A tool for Shadowdark GMs to create, manage, and roll on random encounter tables. Users can generate tables from core monsters, their own custom monsters, or public monsters created by other users. Tables support standard dice sizes (d4, d6, d8, d10, d12, d20, d100) or custom sizes.

## User Flow

```
1. User navigates to /encounter-tables
2. Clicks "Create New Table"
3. Sets table parameters:
   - Name & description
   - Die size (d4, d6, d8, d10, d12, d20, d100, custom)
   - Monster sources (core, custom, public)
   - Level range filter
   - Additional filters (alignment, movement, etc.)
4. Clicks "Generate Random Table"
   - System populates table with unique monsters
5. User can manually adjust any entry
6. Saves table to their profile
7. Optional: Generate shareable public link
```

## Database Schema (Supabase)

### encounter_tables

```sql
CREATE TABLE encounter_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  die_size INTEGER NOT NULL, -- 4, 6, 8, 10, 12, 20, 100, etc.
  is_public BOOLEAN DEFAULT FALSE,
  public_slug TEXT UNIQUE, -- For shareable links (e.g., 'forest-encounters-abc123')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_encounter_tables_user_id ON encounter_tables(user_id);
CREATE INDEX idx_encounter_tables_public_slug ON encounter_tables(public_slug);
CREATE INDEX idx_encounter_tables_is_public ON encounter_tables(is_public);

-- Enable RLS
ALTER TABLE encounter_tables ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own tables"
  ON encounter_tables FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public tables"
  ON encounter_tables FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own tables"
  ON encounter_tables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tables"
  ON encounter_tables FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tables"
  ON encounter_tables FOR DELETE
  USING (auth.uid() = user_id);
```

### encounter_table_entries

```sql
CREATE TABLE encounter_table_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES encounter_tables(id) ON DELETE CASCADE,
  roll_number INTEGER NOT NULL, -- 1-100 depending on die size
  monster_id UUID REFERENCES monsters(id) ON DELETE SET NULL,
  monster_snapshot JSONB, -- Cached monster data for historical accuracy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_id, roll_number)
);

-- Indexes
CREATE INDEX idx_encounter_table_entries_table_id ON encounter_table_entries(table_id);
CREATE INDEX idx_encounter_table_entries_monster_id ON encounter_table_entries(monster_id);

-- Enable RLS
ALTER TABLE encounter_table_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view entries for own tables"
  ON encounter_table_entries FOR SELECT
  USING (
    table_id IN (
      SELECT id FROM encounter_tables WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view entries for public tables"
  ON encounter_table_entries FOR SELECT
  USING (
    table_id IN (
      SELECT id FROM encounter_tables WHERE is_public = true
    )
  );

CREATE POLICY "Users can insert entries for own tables"
  ON encounter_table_entries FOR INSERT
  WITH CHECK (
    table_id IN (
      SELECT id FROM encounter_tables WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries for own tables"
  ON encounter_table_entries FOR UPDATE
  USING (
    table_id IN (
      SELECT id FROM encounter_tables WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries for own tables"
  ON encounter_table_entries FOR DELETE
  USING (
    table_id IN (
      SELECT id FROM encounter_tables WHERE user_id = auth.uid()
    )
  );
```

### Update monsters table

```sql
-- Add is_public column to monsters table for sharing
ALTER TABLE monsters ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE monsters ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Index for public monsters
CREATE INDEX idx_monsters_is_public ON monsters(is_public);
CREATE INDEX idx_monsters_created_by ON monsters(created_by);

-- Update RLS policies to allow viewing public monsters
CREATE POLICY "Anyone can view public monsters"
  ON monsters FOR SELECT
  USING (is_public = true OR created_by IS NULL); -- NULL for core monsters
```

## TypeScript Types

```typescript
// types/encounterTable.ts

export type DieSize = 4 | 6 | 8 | 10 | 12 | 20 | 100 | number;

export interface EncounterTable {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  die_size: DieSize;
  is_public: boolean;
  public_slug?: string;
  created_at: string;
  updated_at: string;
}

export interface EncounterTableEntry {
  id: string;
  table_id: string;
  roll_number: number;
  monster_id?: string;
  monster_snapshot: Monster; // Cached monster data
  created_at: string;
}

export interface EncounterTableWithEntries extends EncounterTable {
  entries: EncounterTableEntry[];
}

export interface TableGenerationFilters {
  minLevel: number;
  maxLevel: number;
  sources: ("core" | "custom" | "public")[];
  alignment?: ("L" | "N" | "C")[];
  movementTypes?: string[]; // 'fly', 'swim', 'burrow', etc.
  searchQuery?: string;
}

export interface RollResult {
  rollNumber: number;
  monster: Monster;
  timestamp: Date;
}
```

## Pages & Routes

### 1\. Encounter Tables List (`/encounter-tables`)

**Purpose**: View all user’s saved encounter tables

**Layout**:

```
┌────────────────────────────────────────────────┐
│ My Encounter Tables                            │
│                                    [+ New]     │
└────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ Forest Encounters│ │ Dungeon Level 1  │
│ d20 table        │ │ d12 table        │
│ 20 entries       │ │ 12 entries       │
│                  │ │                  │
│ [View] [Edit]    │ │ [View] [Edit]    │
│ [Delete] [Share] │ │ [Delete] [Share] │
└──────────────────┘ └──────────────────┘
```

**Features**:

- Grid of encounter table cards
- Quick stats (die size, entry count)
- Actions: View, Edit, Delete, Share
- Search/filter tables by name
- Create new table button

### 2\. Create Table (`/encounter-tables/new`)

**Purpose**: Set up a new random encounter table

**Layout** (Single Column Form):

```
┌────────────────────────────────────────────────┐
│ Create Random Encounter Table                  │
└────────────────────────────────────────────────┘

Table Details:
  Name: [________________]
  Description: [________________]

Die Size:
  ⚀ d4   ⚁ d6   ⚂ d8   ⚃ d10   ⚄ d12   ⚅ d20
  [⚅] d100   [ ] Custom: [___]

Monster Sources:
  ☑ Core Monsters
  ☑ My Custom Monsters
  ☑ Public Community Monsters

Filters:
  Level Range: [1] to [10]
  Alignment: [ ] Lawful [ ] Neutral [ ] Chaotic
  Movement: [ ] Fly [ ] Swim [ ] Burrow [ ] Climb

[Generate Random Table]  [Cancel]
```

**Flow**:

1.  User fills out form
2.  Clicks “Generate Random Table”
3.  System creates table with unique monsters
4.  Redirects to edit page

### 3\. Edit/View Table (`/encounter-tables/[id]`)

**Purpose**: View, edit entries, and roll on the table

**Layout** (Two Column on Desktop):

```
┌─────────────────────────────────────────────────────┐
│ Forest Encounters (d20)                    [⚙ Edit] │
│ A collection of forest creatures                    │
│                                                      │
│ [🎲 Roll d20]  [Save]  [Share]  [Delete]           │
└─────────────────────────────────────────────────────┘

LEFT COLUMN (Table Entries)    RIGHT COLUMN (Details)
┌────────────────────────────┐ ┌─────────────────────┐
│ 1.  Goblin          [Edit] │ │                     │
│ 2.  Wolf            [Edit] │ │ Roll to see monster │
│ 3.  Bandit          [Edit] │ │ details here        │
│ 4.  Giant Spider    [Edit] │ │                     │
│ 5.  Orc             [Edit] │ │                     │
│ ...                        │ │                     │
│ 20. Owlbear         [Edit] │ │                     │
└────────────────────────────┘ └─────────────────────┘

After Rolling:
┌────────────────────────────┐ ┌─────────────────────┐
│ 1.  Goblin          [Edit] │ │ You rolled: 12      │
│ 2.  Wolf            [Edit] │ │                     │
│ ...                        │ │ TROLL               │
│ 12. Troll           [View] │ │ ─────────────────── │
│ ...                ← Highlight│ AC: 15  HP: 45     │
│ 20. Owlbear         [Edit] │ │ Level: 5            │
└────────────────────────────┘ │                     │
                                │ [Full Stat Block]   │
                                │                     │
                                │ [❤️ Add to Favs]   │
                                └─────────────────────┘
```

**Features**:

- List all table entries (1 through die_size)
- Roll button that generates random number
- Highlight rolled entry
- Display full monster stat block in right column
- Edit individual entries (swap monsters)
- Save to favorites from detail view
- Share table (generate public link)
- Responsive: Stacks to single column on mobile

### 4\. Public Table View (`/encounter-tables/shared/[slug]`)

**Purpose**: View publicly shared tables (no edit permissions)

**Features**:

- Same layout as edit/view but read-only
- Can still roll on the table
- Can save to favorites
- “Copy to My Tables” button
- Shows creator username/attribution

## Components Structure

```typescript
components / encounter - tables / TableCard.tsx; // Display single table in list
TableList.tsx; // Grid of table cards
CreateTableForm.tsx; // Form to create new table
TableEditor.tsx; // Main edit interface
TableEntryRow.tsx; // Single entry in table
MonsterDetailPanel.tsx; // Right column monster display
DiceSizeSelector.tsx; // Radio buttons for die sizes
FilterPanel.tsx; // Collapsible filter options
RollButton.tsx; // Animated roll button
ShareDialog.tsx; // Modal for sharing table
EditEntryDialog.tsx; // Modal to change monster on entry
```

## Key Algorithms

### 1\. Random Table Generation

```typescript
// utils/generateRandomTable.ts

interface GenerateTableParams {
  dieSize: number;
  filters: TableGenerationFilters;
}

export async function generateRandomTable(
  params: GenerateTableParams,
): Promise<EncounterTableEntry[]> {
  const { dieSize, filters } = params;

  // 1. Fetch available monsters based on filters
  const availableMonsters = await fetchFilteredMonsters(filters);

  // 2. Shuffle monsters
  const shuffled = shuffleArray(availableMonsters);

  // 3. Take first N monsters (where N = dieSize)
  const selectedMonsters = shuffled.slice(0, dieSize);

  // 4. If not enough unique monsters, throw error
  if (selectedMonsters.length < dieSize) {
    throw new Error(
      `Not enough monsters match your criteria. Found ${selectedMonsters.length}, need ${dieSize}`,
    );
  }

  // 5. Create entries with roll numbers
  const entries: EncounterTableEntry[] = selectedMonsters.map(
    (monster, index) => ({
      id: crypto.randomUUID(),
      table_id: "", // Will be set when saving
      roll_number: index + 1,
      monster_id: monster.id,
      monster_snapshot: monster,
      created_at: new Date().toISOString(),
    }),
  );

  return entries;
}

async function fetchFilteredMonsters(
  filters: TableGenerationFilters,
): Promise<Monster[]> {
  let query = supabase
    .from("monsters")
    .select("*")
    .gte("level", filters.minLevel)
    .lte("level", filters.maxLevel);

  // Filter by source
  if (!filters.sources.includes("core")) {
    query = query.not("created_by", "is", null);
  }
  if (filters.sources.includes("custom")) {
    query = query.or(`created_by.eq.${auth.user.id}`);
  }
  if (filters.sources.includes("public")) {
    query = query.or("is_public.eq.true");
  }

  // Filter by alignment
  if (filters.alignment && filters.alignment.length > 0) {
    query = query.in("alignment", filters.alignment);
  }

  // Filter by movement types
  if (filters.movementTypes && filters.movementTypes.length > 0) {
    // This requires parsing the movement string
    // Example: "near (fly, swim)" -> contains 'fly' and 'swim'
    const movementConditions = filters.movementTypes
      .map((type) => `movement.ilike.%${type}%`)
      .join(",");
    query = query.or(movementConditions);
  }

  // Search query
  if (filters.searchQuery) {
    query = query.or(
      `name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`,
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 2\. Roll on Table

```typescript
// utils/rollOnTable.ts

export function rollOnTable(
  dieSize: number,
  entries: EncounterTableEntry[],
): RollResult {
  // Roll random number from 1 to dieSize
  const roll = Math.floor(Math.random() * dieSize) + 1;

  // Find entry matching roll number
  const entry = entries.find((e) => e.roll_number === roll);

  if (!entry) {
    throw new Error(`No entry found for roll ${roll}`);
  }

  return {
    rollNumber: roll,
    monster: entry.monster_snapshot,
    timestamp: new Date(),
  };
}
```

### 3\. Generate Public Slug

```typescript
// utils/generateSlug.ts

export async function generateUniqueSlug(tableName: string): Promise<string> {
  // Create base slug from name
  const baseSlug = tableName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50); // Limit length

  // Add random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const slug = `${baseSlug}-${randomSuffix}`;

  // Check if slug exists
  const { data } = await supabase
    .from("encounter_tables")
    .select("id")
    .eq("public_slug", slug)
    .single();

  // If exists, try again recursively
  if (data) {
    return generateUniqueSlug(tableName);
  }

  return slug;
}
```

## API Routes/Server Actions

```typescript
// app/actions/encounterTables.ts

"use server";

export async function createEncounterTable(
  params: CreateTableParams,
): Promise<EncounterTable> {
  // 1. Generate entries
  const entries = await generateRandomTable({
    dieSize: params.dieSize,
    filters: params.filters,
  });

  // 2. Create table
  const { data: table, error: tableError } = await supabase
    .from("encounter_tables")
    .insert({
      user_id: auth.user.id,
      name: params.name,
      description: params.description,
      die_size: params.dieSize,
    })
    .select()
    .single();

  if (tableError) throw tableError;

  // 3. Create entries
  const entriesWithTableId = entries.map((e) => ({
    ...e,
    table_id: table.id,
  }));

  const { error: entriesError } = await supabase
    .from("encounter_table_entries")
    .insert(entriesWithTableId);

  if (entriesError) throw entriesError;

  return table;
}

export async function updateTableEntry(
  entryId: string,
  monsterId: string,
): Promise<void> {
  // Fetch monster
  const { data: monster } = await supabase
    .from("monsters")
    .select("*")
    .eq("id", monsterId)
    .single();

  // Update entry
  await supabase
    .from("encounter_table_entries")
    .update({
      monster_id: monsterId,
      monster_snapshot: monster,
    })
    .eq("id", entryId);
}

export async function makeTablePublic(tableId: string): Promise<string> {
  // Get table
  const { data: table } = await supabase
    .from("encounter_tables")
    .select("name")
    .eq("id", tableId)
    .single();

  // Generate slug
  const slug = await generateUniqueSlug(table.name);

  // Update table
  await supabase
    .from("encounter_tables")
    .update({
      is_public: true,
      public_slug: slug,
    })
    .eq("id", tableId);

  return slug;
}

export async function copyTableToMyTables(
  publicSlug: string,
): Promise<EncounterTable> {
  // Fetch public table
  const { data: sourceTable } = await supabase
    .from("encounter_tables")
    .select("*, entries:encounter_table_entries(*)")
    .eq("public_slug", publicSlug)
    .single();

  // Create copy
  const { data: newTable } = await supabase
    .from("encounter_tables")
    .insert({
      user_id: auth.user.id,
      name: `${sourceTable.name} (Copy)`,
      description: sourceTable.description,
      die_size: sourceTable.die_size,
    })
    .select()
    .single();

  // Copy entries
  const newEntries = sourceTable.entries.map((e) => ({
    table_id: newTable.id,
    roll_number: e.roll_number,
    monster_id: e.monster_id,
    monster_snapshot: e.monster_snapshot,
  }));

  await supabase.from("encounter_table_entries").insert(newEntries);

  return newTable;
}
```

## UI/UX Details

### Die Size Selector

```tsx
const DIE_SIZES = [4, 6, 8, 10, 12, 20, 100];

export function DiceSizeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {DIE_SIZES.map((size) => (
        <Button
          key={size}
          variant={value === size ? "default" : "outline"}
          onClick={() => onChange(size)}
        >
          d{size}
        </Button>
      ))}
      <Button
        variant={!DIE_SIZES.includes(value) ? "default" : "outline"}
        onClick={() => setShowCustomInput(true)}
      >
        Custom
      </Button>
    </div>
  );
}
```

### Roll Animation

```tsx
export function RollButton({ onRoll, dieSize }) {
  const [rolling, setRolling] = useState(false);

  const handleRoll = async () => {
    setRolling(true);

    // Animate for 1 second
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        // Show random numbers during animation
        const tempRoll = Math.floor(Math.random() * dieSize) + 1;
        setDisplayValue(tempRoll);
        requestAnimationFrame(animate);
      } else {
        // Show final result
        const result = onRoll();
        setDisplayValue(result.rollNumber);
        setRolling(false);
      }
    };

    animate();
  };

  return (
    <Button
      onClick={handleRoll}
      disabled={rolling}
      className="text-2xl font-bold"
    >
      🎲 Roll d{dieSize}
    </Button>
  );
}
```

### Share Dialog

```tsx
export function ShareDialog({ table, onClose }) {
  const [isPublic, setIsPublic] = useState(table.is_public);
  const [publicUrl, setPublicUrl] = useState("");

  const handleMakePublic = async () => {
    const slug = await makeTablePublic(table.id);
    const url = `${window.location.origin}/encounter-tables/shared/${slug}`;
    setPublicUrl(url);
    setIsPublic(true);
  };

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Encounter Table</DialogTitle>
        </DialogHeader>
        {isPublic ? (
          <div>
            <Label>Public URL</Label>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly />
              <Button onClick={() => copyToClipboard(publicUrl)}>Copy</Button>
            </div>
          </div>
        ) : (
          <div>
            <p>Make this table public to share it with others.</p>
            <Button onClick={handleMakePublic}>Make Public</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Implementation Phases

### Phase 1: Database & Core Functionality

- [ ] Create `encounter_tables` table with RLS
- [ ] Create `encounter_table_entries` table with RLS
- [ ] Update `monsters` table with `is_public` column
- [ ] Implement random table generation algorithm
- [ ] Implement roll functionality

### Phase 2: Table Management UI

- [ ] Create table list page (`/encounter-tables`)
- [ ] Create table creation form (`/encounter-tables/new`)
- [ ] Build filter panel component
- [ ] Implement table CRUD operations
- [ ] Add table cards with actions

### Phase 3: Table Editor & Rolling

- [ ] Build table editor page (`/encounter-tables/[id]`)
- [ ] Implement two-column layout (table entries + monster detail)
- [ ] Add roll button with animation
- [ ] Display rolled monster in right panel
- [ ] Add “Edit Entry” functionality
- [ ] Integrate with monster detail view

### Phase 4: Sharing & Public Tables

- [ ] Implement slug generation
- [ ] Add share dialog with public link
- [ ] Create public table view page (`/encounter-tables/shared/[slug]`)
- [ ] Add “Copy to My Tables” functionality
- [ ] Show creator attribution

### Phase 5: Polish & Enhancement

- [ ] Add validation for table generation
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Mobile responsive design
- [ ] Add keyboard shortcuts
- [ ] Roll history/log

## Testing Considerations

### Edge Cases

- **Not enough monsters**: What if filters result in fewer monsters than die size?
  - Show error: “Only X monsters match your criteria. Need at least Y.”
- **Custom die size validation**: Limit to reasonable range (2-1000)
- **Deleted monsters**: Use snapshot data if monster is deleted
- **Public slug collision**: Regenerate if slug already exists

### Validation Rules

- Table name: 3-100 characters, required
- Die size: 2-1000, required
- Level range: min <= max, both 1-20
- At least one monster source must be selected

## Future Enhancements

- **Weighted tables**: Allow monsters to appear on multiple numbers
- **Categories/tags**: Organize tables by theme
- **Import/export**: JSON format for sharing
- **Roll with quantity**: “1d4 Goblins” instead of just “Goblin”
- **Nested tables**: Roll on table A, which references table B
- **Table templates**: Pre-made tables for common scenarios
- **Roll history**: Track past rolls with timestamps
- **Probability view**: Show % chance for each entry
- **Random quantity**: Auto-generate encounter quantities
- **Integration**: “Add rolled result to encounter builder”
