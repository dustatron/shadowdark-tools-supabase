# Phase 0: Research - Random Encounter Tables

**Date**: 2025-10-22
**Feature**: Random Encounter Tables
**Status**: Complete

## Research Areas

### 1. Monster Snapshot Strategy

**Decision**: Store complete monster data as JSONB in `encounter_table_entries.monster_snapshot` column

**Rationale**:

- Preserves historical accuracy even if source monsters are modified/deleted
- Avoids complex JOIN queries for display (performance optimization)
- Simplifies RLS policies (no need to check monster permissions)
- JSONB supports flexible querying if needed for future features

**Alternatives Considered**:

- **Foreign key only**: Rejected - tables break when monsters deleted
- **Separate snapshot table**: Rejected - adds unnecessary complexity for 1:1 relationship
- **Copy to separate columns**: Rejected - monster schema has 15+ fields including nested JSONB

**Implementation Notes**:

- Snapshot created at entry insert time
- Includes all fields from `all_monsters` view (official + public user monsters)
- No automatic updates when source monster changes (intentional)

### 2. Dice Rolling Animation

**Decision**: CSS-based keyframe animation with JavaScript state management

**Rationale**:

- Smooth 60fps performance without game engines
- Lightweight (~50 lines of code)
- Works on mobile devices
- Familiar React patterns (useState + useEffect)

**Alternatives Considered**:

- **Canvas/WebGL**: Rejected - overkill for simple dice animation
- **Third-party library (dice-box, dice-roller-3d)**: Rejected - adds 200KB+ bundle size for minimal value
- **SVG animation**: Rejected - less performant for rapid state changes

**Implementation Pattern**:

```typescript
// Pseudocode - actual implementation in DiceRoller.tsx
const [rolling, setRolling] = useState(false);
const [result, setResult] = useState<number | null>(null);

async function roll() {
  setRolling(true);
  setResult(null);

  // Animate for ~1 second with random intermediate values
  const frames = 20;
  for (let i = 0; i < frames; i++) {
    await sleep(50);
    setResult(randomInt(1, dieSize));
  }

  // Set final result
  const finalResult = randomInt(1, dieSize);
  setResult(finalResult);
  setRolling(false);

  // Notify parent component
  onRollComplete(finalResult);
}
```

### 3. Public URL Slug Generation

**Decision**: Nanoid (8 characters, URL-safe) with collision detection

**Rationale**:

- Nanoid generates cryptographically strong random IDs
- 8 characters = 218 trillion combinations (effectively collision-free)
- URL-safe alphabet (no special encoding needed)
- Shorter than UUID (8 vs 36 characters)
- Industry standard (used by Next.js, Prisma, etc.)

**Alternatives Considered**:

- **Sequential integers**: Rejected - reveals table count, easy to enumerate
- **UUID v4**: Rejected - unnecessarily long for URLs
- **Hash of table name**: Rejected - not guaranteed unique, reveals info
- **Base64 timestamp**: Rejected - predictable, potential collisions

**Implementation**:

```sql
-- Database column
public_slug VARCHAR(8) UNIQUE;

-- Unique index for fast lookups
CREATE UNIQUE INDEX idx_encounter_tables_public_slug
ON encounter_tables(public_slug)
WHERE public_slug IS NOT NULL;
```

```typescript
// Generation with collision handling
import { nanoid } from "nanoid";

async function generateUniqueSlug(): Promise<string> {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const slug = nanoid(8);
    const { count } = await supabase
      .from("encounter_tables")
      .select("id", { count: "exact", head: true })
      .eq("public_slug", slug);

    if (count === 0) return slug;
  }
  throw new Error("Failed to generate unique slug");
}
```

### 4. Monster Filtering with Complex Criteria

**Decision**: PostgreSQL JSONB queries with pg_trgm for text search

**Rationale**:

- All monster data already in database (no external service needed)
- JSONB operators handle complex nested data (attacks, abilities)
- pg_trgm extension provides fuzzy text matching
- Single query for all filters (no multiple round trips)
- Indexes support fast filtering

**Alternatives Considered**:

- **Client-side filtering**: Rejected - poor performance with 500+ monsters
- **Elasticsearch**: Rejected - adds infrastructure complexity
- **Full-text search (tsvector)**: Considered - pg_trgm simpler for this use case

**Query Pattern**:

```sql
-- Example: Filter monsters by level range, alignment, movement, and text search
SELECT * FROM all_monsters
WHERE
  challenge_level BETWEEN $1 AND $2
  AND ($3::text[] IS NULL OR alignment = ANY($3))
  AND ($4::text[] IS NULL OR movement_types && $4)
  AND ($5::text IS NULL OR name ILIKE '%' || $5 || '%' OR description ILIKE '%' || $5 || '%')
  AND ($6::boolean IS NULL OR source = 'official')
ORDER BY RANDOM()
LIMIT $7;
```

### 5. Table Entry Management (Unique Monster Selection)

**Decision**: Application-level uniqueness check + database-level constraint

**Rationale**:

- Ensures no duplicate monsters in single table
- Two-layer validation (UX + data integrity)
- Supports "replace with random different monster" feature

**Implementation**:

```sql
-- Composite unique constraint
CREATE UNIQUE INDEX idx_encounter_entries_unique_monster
ON encounter_table_entries(table_id, monster_id)
WHERE monster_id IS NOT NULL;

-- Roll number uniqueness within table
CREATE UNIQUE INDEX idx_encounter_entries_unique_roll
ON encounter_table_entries(table_id, roll_number);
```

```typescript
// Application logic for "replace with random"
async function replaceWithRandomMonster(tableId: string, rollNumber: number) {
  // Get current monsters in table
  const { data: currentEntries } = await supabase
    .from("encounter_table_entries")
    .select("monster_id")
    .eq("table_id", tableId);

  const usedMonsterIds = currentEntries.map((e) => e.monster_id);

  // Get table filters
  const { data: table } = await supabase
    .from("encounter_tables")
    .select("filters")
    .eq("id", tableId)
    .single();

  // Query monsters matching filters, excluding already used
  const { data: candidates } = await supabase
    .from("all_monsters")
    .select("*")
    .not("id", "in", `(${usedMonsterIds.join(",")})`)
    .applyFilters(table.filters) // Apply stored filters
    .limit(1);

  if (candidates.length === 0) {
    throw new Error("No available monsters match your criteria");
  }

  // Update entry with new monster
  await supabase
    .from("encounter_table_entries")
    .update({
      monster_id: candidates[0].id,
      monster_snapshot: candidates[0],
    })
    .eq("table_id", tableId)
    .eq("roll_number", rollNumber);
}
```

### 6. RLS Policies for Multi-Tenancy

**Decision**: Row Level Security with composite policies for ownership + public access

**Rationale**:

- Database-enforced security (no API bypass possible)
- Supports complex access patterns (owner full access, public read-only)
- Integrates with Supabase Auth (@supabase/ssr)

**Policy Structure**:

```sql
-- encounter_tables policies
CREATE POLICY "Users can view own tables"
ON encounter_tables FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view public tables"
ON encounter_tables FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can insert own tables"
ON encounter_tables FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tables"
ON encounter_tables FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tables"
ON encounter_tables FOR DELETE
USING (user_id = auth.uid());

-- encounter_table_entries policies (inherit from parent table)
CREATE POLICY "Users can view entries for accessible tables"
ON encounter_table_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_table_entries.table_id
    AND (user_id = auth.uid() OR is_public = true)
  )
);

CREATE POLICY "Users can manage entries for own tables"
ON encounter_table_entries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_table_entries.table_id
    AND user_id = auth.uid()
  )
);
```

### 7. Form Validation Strategy

**Decision**: React Hook Form + Zod with shadcn/ui Form components (Note: Constitution specifies Mantine UI, verify project context)

**Rationale**:

- Type-safe validation with TypeScript inference
- Server-side validation reuses same Zod schemas
- Error messages co-located with schemas
- Industry standard pattern in Next.js ecosystem

**Schema Example**:

```typescript
import { z } from "zod";

export const EncounterTableCreateSchema = z
  .object({
    name: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    die_size: z.number().int().min(2).max(1000),
    filters: z.object({
      sources: z.array(z.enum(["official", "user", "public"])).min(1),
      level_min: z.number().int().min(1).max(20).default(1),
      level_max: z.number().int().min(1).max(20).default(20),
      alignments: z.array(z.enum(["Lawful", "Neutral", "Chaotic"])).optional(),
      movement_types: z
        .array(z.enum(["fly", "swim", "burrow", "climb"]))
        .optional(),
      search_query: z.string().max(100).optional(),
    }),
  })
  .refine((data) => data.filters.level_min <= data.filters.level_max, {
    message: "Min level must be <= max level",
    path: ["filters.level_min"],
  });

export type EncounterTableCreate = z.infer<typeof EncounterTableCreateSchema>;
```

## Technical Unknowns Resolved

All technical context items are now resolved. No NEEDS CLARIFICATION markers remain.

## Next Steps

Proceed to Phase 1: Design & Contracts

- Generate data model from entity definitions
- Create OpenAPI contracts for all 11 endpoints
- Write contract tests (initially failing)
- Create quickstart guide
- Update CLAUDE.md with new feature context
