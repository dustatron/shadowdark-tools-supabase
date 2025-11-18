# Tasks: Magic Items (Read-Only Starter)

**Input**: Design documents from `/specs/011-i-would-to/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Summary

Read-only magic items feature following spells pattern. Total: **12 tasks** (testing skipped per user request).

**Tech Stack**: Next.js 15 App Router, TypeScript 5, Supabase PostgreSQL, shadcn/ui, Tailwind CSS
**Pattern**: Server-side search, follow existing spells implementation
**Scope**: Browse, search, detail view only (no favorites, no mutations)

## Architecture Decisions

Per nextjs-architect review:

- ✅ API response: `{ data: MagicItem[], count: number }` (matches spells)
- ✅ Server-side search via searchParams (not client-side filtering)
- ✅ Component organization: `components/magic-items/` directory
- ✅ Seeding: Generate SQL INSERT statements (not json_populate_recordset)
- ✅ Indexes: Simplified (slug unique, name trgm, full-text search)
- ✅ Navigation: Add to left sidebar nav

## Path Conventions

Repository root paths:

- Database: `supabase/migrations/`
- API Routes: `app/api/magic-items/`
- Pages: `app/magic-items/`
- Components: `components/magic-items/`
- Scripts: `scripts/`

## Phase 1: Database Setup

- [ ] **T001** Create migration `supabase/migrations/[timestamp]_create_official_magic_items.sql`
  - CREATE TABLE official_magic_items (id UUID PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT NOT NULL, traits JSONB DEFAULT '[]', created_at, updated_at)
  - CHECK constraints: name not empty, slug format `^[a-z0-9_-]+$`, description not empty, traits is array
  - CREATE UNIQUE INDEX on slug
  - CREATE GIN INDEX on name using gin_trgm_ops
  - CREATE GIN INDEX on full-text search (to_tsvector on name + description)
  - ALTER TABLE ENABLE ROW LEVEL SECURITY
  - CREATE POLICY "Public read" FOR SELECT USING (true)

- [ ] **T002** Generate seed data SQL using Node.js script `scripts/generate-magic-items-seed.ts`
  - Read `starter-data/magic-items.json`
  - Convert to SQL INSERT statements (escape quotes, handle JSONB)
  - Output to `supabase/migrations/[timestamp]_seed_official_magic_items.sql`
  - 150 INSERT statements total

- [ ] **T003** Apply migrations to local Supabase
  - Run: `supabase db push`
  - Verify: `SELECT COUNT(*) FROM official_magic_items;` (expect 150)
  - Test query: `SELECT * FROM official_magic_items WHERE slug = 'ring_of_invisibility';`

## Phase 2: API Implementation

- [ ] **T004** Create Zod schemas in `lib/validations/magic-items.ts`
  - TraitSchema: z.object({ name: z.enum(['Benefit', 'Curse', 'Bonus', 'Personality']), description: z.string() })
  - MagicItemSchema: z.object({ id: z.string().uuid(), name, slug, description, traits: z.array(TraitSchema), created_at, updated_at })
  - MagicItemListResponseSchema: z.object({ data: z.array(MagicItemSchema), count: z.number() })
  - SearchQuerySchema: z.object({ search: z.string().max(100).optional() })

- [ ] **T005** Implement GET /api/magic-items route in `app/api/magic-items/route.ts`
  - Extract searchParams with NextRequest (search query optional)
  - Create Supabase client: `const supabase = await createClient()`
  - Base query: `supabase.from('official_magic_items').select('*', { count: 'exact' })`
  - If search: add `.or(\`name.ilike.%${search}%,description.ilike.%${search}%\`)`
  - Order by name ASC
  - Return: `NextResponse.json({ data, count })`
  - Error handling: 400 for invalid search, 500 for DB errors

- [ ] **T006** Implement GET /api/magic-items/[slug]/route.ts
  - Await params: `const { slug } = await params`
  - Validate slug format with regex `^[a-z0-9_-]+$` (return 400 if invalid)
  - Create Supabase client: `const supabase = await createClient()`
  - Query: `.from('official_magic_items').select('*').eq('slug', slug).single()`
  - Return: `NextResponse.json({ data })` on success
  - Return: 404 if not found, 500 for DB errors

## Phase 3: UI Components

- [ ] **T007** Create TraitBadge component in `components/magic-items/TraitBadge.tsx`
  - Props: `{ trait: { name: string, description: string } }`
  - Use shadcn/ui Badge component
  - Variant mapping: Benefit='default' (blue), Curse='destructive' (red), Bonus='secondary' (purple), Personality='outline' (neutral)
  - Display trait.name as badge text
  - Tooltip or expand for trait.description

- [ ] **T008** Create MagicItemCard component in `components/magic-items/MagicItemCard.tsx`
  - Props: `{ item: MagicItem }`
  - Use shadcn/ui Card component
  - Display: name (heading), description (truncated ~150 chars), trait count badge
  - Click navigates to `/magic-items/${item.slug}`
  - Data attribute: `data-testid="magic-item-card"`

## Phase 4: Pages

- [ ] **T009** Create list page in `app/magic-items/page.tsx`
  - Server Component with `searchParams: { search?: string }`
  - Fetch from Supabase: `await supabase.from('official_magic_items').select('*')`
  - If searchParams.search: filter with `.or(\`name.ilike.%${search}%,description.ilike.%${search}%\`)`
  - Order by name ASC
  - Render: search Input (form with GET action), grid of MagicItemCard components
  - Empty state if no results
  - Data attribute on search: `data-testid="search-input"`

- [ ] **T010** Create detail page in `app/magic-items/[slug]/page.tsx`
  - Server Component, await params: `const { slug } = await params`
  - Fetch: `await supabase.from('official_magic_items').select('*').eq('slug', slug).single()`
  - Return notFound() if not found
  - Render: full name (h1), description (p), traits section with TraitBadge for each trait
  - Group traits by type (Benefits, Curses, Bonuses, Personality sections)
  - Back button to /magic-items

## Phase 5: Navigation Integration

- [ ] **T011** Add magic items to sidebar navigation
  - File: `components/Sidebar.tsx` or `app/layout.tsx` (wherever nav is defined)
  - Add link: `{ href: '/magic-items', label: 'Magic Items', icon: <Sparkles /> }` (or appropriate Lucide icon)
  - Position: After Spells, before other links
  - Ensure active state styling works

## Phase 6: Polish

- [ ] **T012** Manual validation using quickstart scenarios
  - Navigate to /magic-items, verify list renders
  - Search for "ring", verify results filter
  - Click "Ring of Invisibility", verify detail page
  - Verify traits display with correct badge colors
  - Check performance: list <100ms, search <200ms, detail <50ms
  - Test 404 handling: visit /magic-items/nonexistent-slug
  - Verify sidebar navigation link works

## Dependencies

### Blocking

- **T001-T003** (Database) must complete before any other tasks
- **T004** (Schemas) before T005-T006 (API uses schemas)
- **T007-T008** (Components) before T009-T010 (Pages use components)
- **T001-T010** (Implementation) before T011-T012 (Integration/validation)

### Sequential

- T001 → T002 → T003 (migrations in order)
- T004 → T005 → T006 (schemas then API routes)
- T007 → T008 → T009 → T010 (components then pages)

### No Parallelization

- Testing skipped, so no parallel test execution
- All implementation tasks sequential for simplicity

## Task Details

### T002: Generate Seed Data Script

**File**: `scripts/generate-magic-items-seed.ts`
**Purpose**: Convert JSON to SQL INSERT statements

```typescript
import fs from "fs";
import path from "path";

interface MagicItem {
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
}

const items: MagicItem[] = JSON.parse(
  fs.readFileSync("starter-data/magic-items.json", "utf-8"),
);

const escapeSql = (str: string) => str.replace(/'/g, "''");

const sql = `-- Generated from starter-data/magic-items.json
-- Total items: ${items.length}

INSERT INTO official_magic_items (name, slug, description, traits) VALUES
${items
  .map((item) => {
    const traitsJson = JSON.stringify(item.traits).replace(/'/g, "''");
    return `  ('${escapeSql(item.name)}', '${item.slug}', '${escapeSql(item.description)}', '${traitsJson}'::jsonb)`;
  })
  .join(",\n")}
;
`;

const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
const filename = `supabase/migrations/${timestamp}_seed_official_magic_items.sql`;

fs.writeFileSync(filename, sql);
console.log(`✅ Generated ${filename} with ${items.length} items`);
```

Run with: `npx tsx scripts/generate-magic-items-seed.ts`

### T005: API List Route

**Pattern**: Follow `app/api/spells/route.ts` implementation
**Key Requirements**:

- Use `await createClient()` from `@/lib/supabase/server`
- Extract search from `request.nextUrl.searchParams`
- Use `.or()` for multi-column search (name OR description)
- Return `{ data, count }` (count from `{ count: 'exact' }` option)

### T009: List Page with Search

**Pattern**: Server Component with searchParams, form with GET action
**Key Requirements**:

- `export default async function MagicItemsPage({ searchParams }: { searchParams: { search?: string } })`
- Form: `<form method="GET"><Input name="search" defaultValue={searchParams.search} /></form>`
- Filter Supabase query if searchParams.search present
- No client-side state needed (URL is source of truth)

### T011: Sidebar Navigation

**Icon Recommendation**: `<Sparkles />` from lucide-react (matches magical theme)
**Placement**: In navigation array/links list between Spells and other items
**Active State**: Should highlight when pathname === '/magic-items'

## Success Criteria

- [ ] All 12 tasks completed
- [ ] 150 magic items seeded in database
- [ ] GET /api/magic-items returns `{ data, count }` with all items
- [ ] GET /api/magic-items?search=ring filters correctly
- [ ] GET /api/magic-items/[slug] returns single item
- [ ] /magic-items page renders grid of items
- [ ] Search form filters items server-side
- [ ] /magic-items/[slug] shows full detail with traits
- [ ] Traits display with correct badge colors (Benefit=blue, Curse=red, etc.)
- [ ] Sidebar navigation includes Magic Items link
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance targets met (list <100ms, search <200ms, detail <50ms)

## Notes

- **No Tests**: Per user request, skipping all test tasks for initial implementation
- **No Favorites**: Deferred to Phase 2 (user_favorites integration)
- **Server-Side Search**: Using searchParams and URL state, not client-side filtering
- **Component Location**: `components/magic-items/` not `components/` root
- **API Pattern**: Matches spells (`{ data, count }`), not monsters
- **Seeding**: Must generate SQL file, can't use json_populate_recordset in migration
- **Next.js 15**: Remember `await params` in dynamic routes

## Future Enhancements (Phase 2)

- User favorites/bookmarks (user_favorites table extension)
- Filter by trait type (JSONB querying)
- Pagination (offset/limit for list endpoint)
- User-created magic items (mutations)
- Admin moderation interface
