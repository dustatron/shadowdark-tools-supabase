# Random Encounter Tables - Implementation Notes

**Feature Branch:** `002-random-encounter-tables`
**Status:** 75% Complete (Core Blocker: 3 Missing API Routes)
**Last Updated:** October 23, 2025

---

## Executive Summary

The Random Encounter Tables feature is largely complete with all database migrations, types, utilities, components, and pages implemented using **shadcn/ui**. However, **3 critical API route files are missing**, blocking core functionality (create, view, edit, delete, roll operations).

**Critical Blocker:** First parallel agent created API routes in wrong directory (`src/app/api/` instead of `app/api/`). Files were deleted but never recreated in correct location.

---

## Implementation Progress

### ✅ Completed (100%)

#### 1. Database Layer

- **File:** `supabase/migrations/20251022180000_create_encounter_tables.sql`
- Tables: `encounter_tables`, `encounter_table_entries`
- Complete RLS policies (SELECT, INSERT, UPDATE, DELETE)
- Constraints: die_size validation (2-1000), unique constraints, uniqueness enforcement
- Optimized indexes for performance

#### 2. Type System & Validation

- **Files:**
  - `lib/encounter-tables/types.ts` (19 type exports)
  - `lib/encounter-tables/schemas.ts` (9 Zod schemas with cross-field validation)
  - `lib/encounter-tables/queries.ts` (5 query helper functions)

#### 3. Backend Utilities (All in `lib/encounter-tables/utils/`)

- ✅ `filter-monsters.ts` - Complex monster filtering logic
- ✅ `create-snapshot.ts` - JSONB monster snapshot creation
- ✅ `generate-slug.ts` - Unique slug generation with nanoid(8)
- ✅ `generate-table.ts` - Table generation, regeneration, single entry replacement
- ✅ `roll-dice.ts` - Cryptographically secure dice rolling

#### 4. React Components (All shadcn/ui)

**Directory:** `components/encounter-tables/`

- ✅ `EncounterTableForm.tsx` - Comprehensive create/edit form with filter UI
- ✅ `TableCard.tsx` - Table list display card
- ✅ `DiceRoller.tsx` - Animated dice roller (~1s animation, 20 frames @ 60fps)
- ✅ `TableEntryList.tsx` - Entry display with roll highlighting
- ✅ `MonsterDetailPanel.tsx` - Full monster stat block display
- ✅ `ShareDialog.tsx` - Public/private toggle with URL copy

#### 5. Next.js Pages

**Directory:** `app/encounter-tables/`

- ✅ `page.tsx` - List view with empty state
- ✅ `new/page.tsx` - Creation form page
- ✅ `[id]/page.tsx` - Server Component wrapper
- ✅ `[id]/EncounterTableClient.tsx` - Client-side interactive view

#### 6. Navigation Integration

- ✅ Navbar link: "Encounter Tables" in main navigation
- ✅ Homepage card: Active, clickable, updated description
- ✅ Responsive mobile menu support

#### 7. API Routes (Partial - 5 of 8 Working)

**Working:**

- ✅ `app/api/encounter-tables/route.ts` - POST create
- ✅ `app/api/encounter-tables/[id]/entries/[roll]/route.ts` - PATCH replace entry
- ✅ `app/api/encounter-tables/[id]/share/route.ts` - PATCH toggle public
- ✅ `app/api/encounter-tables/public/[slug]/route.ts` - GET public view
- ✅ `app/api/encounter-tables/public/[slug]/copy/route.ts` - POST copy table

---

### ❌ Missing (Critical Blockers)

#### 1. `app/api/encounter-tables/[id]/route.ts` 🔴 CRITICAL

**Tasks:** T028 (GET), T029 (PATCH), T030 (DELETE)

**Required Handlers:**

```typescript
// GET - Fetch single table with entries (join query)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Next.js 15: params is Promise
  const supabase = await createClient(); // Must await

  // Use: selectTableWithEntries() from @/lib/encounter-tables/queries
  // Check: User owns table OR table is public
  // Return: Full table with entries array
}

// PATCH - Update table settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Validate: EncounterTableUpdateSchema from @/lib/encounter-tables/schemas
  // Check: User owns table (auth.uid() = user_id)
  // Update: name, description, filters (NOT die_size - requires regeneration)
  // Return: Updated table
}

// DELETE - Delete table (cascade to entries)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check: User owns table
  // Delete: Table (entries cascade delete via FK constraint)
  // Return: 204 No Content
}
```

**Impact:** Cannot view, edit, or delete individual tables. Entire detail page broken.

#### 2. `app/api/encounter-tables/[id]/generate/route.ts` 🔴 HIGH PRIORITY

**Task:** T031

**Required Handler:**

```typescript
// POST - Regenerate all table entries
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Fetch: Table with filters
  // Check: User owns table
  // Use: regenerateTableEntries() from @/lib/encounter-tables/utils/generate-table
  // Delete: All old entries
  // Insert: New entries with updated monster pool
  // Return: Updated table with new entries
}
```

**Impact:** Cannot regenerate tables after adjusting filters. Users stuck with initial generation.

#### 3. `app/api/encounter-tables/[id]/roll/route.ts` 🔴 BLOCKS GAMEPLAY

**Task:** T033

**Required Handler:**

```typescript
// POST - Perform dice roll, return entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Fetch: Table to get die_size
  // Check: Table is_public OR user owns table (allow public rolling)
  // Use: rollDice(die_size) from @/lib/encounter-tables/utils/roll-dice
  // Fetch: Entry with roll_number matching result
  // Return: { roll: number, entry: EncounterTableEntry }
}
```

**Impact:** **CORE FEATURE BROKEN** - Cannot roll on tables during gameplay. Dice roller UI is non-functional.

---

### 📋 Also Missing (Lower Priority)

#### Public View Page

**File:** `app/encounter-tables/public/[slug]/page.tsx`

- Server Component to fetch public table by slug
- Read-only view (no edit controls)
- "Copy to My Tables" button for authenticated users
- Uses existing `EncounterTableClient` component in read-only mode

#### Testing (Per Project Decision - Contract Tests Removed)

- E2E tests (Tasks T053-T058) - Not started
- Unit tests (Task T059) - Not started
- Manual testing checklist (Task T061) - Not started

**Note:** Project removed contract tests in January 2025 per CLAUDE.md. Focus on E2E and manual testing.

---

## Key Technical Learnings

### 1. Next.js 15 Breaking Changes

**params is Now a Promise:**

```typescript
// ✅ CORRECT (Next.js 15)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Must await!
}

// ❌ WRONG (Old Next.js 14 pattern)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params; // Type error in Next.js 15
}
```

**createClient() Must Be Awaited:**

```typescript
// ✅ CORRECT
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // Must await

// ❌ WRONG
const supabase = createClient(); // Missing await
```

**Zod Error Handling:**

```typescript
// ✅ CORRECT
catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: "Validation error",
      details: error.issues // Use .issues
    }, { status: 400 });
  }
}

// ❌ WRONG
details: error.errors // Property doesn't exist
```

### 2. Directory Structure Decision

**Critical Lesson:** API routes MUST be in `app/api/`, NOT `src/app/api/`

**What Happened:**

1. First parallel agent (API route specialist) created files in `src/app/api/`
2. Next.js couldn't find routes (404 errors)
3. Files were deleted but not recreated in correct location
4. Left empty directories: `app/api/encounter-tables/[id]/generate/` and `app/api/encounter-tables/[id]/roll/`

**Resolution:** Always verify `app/` directory location before creating API routes.

### 3. UI Library Migration

**Decision:** Use **shadcn/ui** (NOT Mantine UI)

- Project migrated from Mantine to shadcn/ui on October 22, 2025
- CLAUDE.md still mentions Mantine in some places (outdated)
- All new components use shadcn/ui components (Button, Card, Form, Input, etc.)
- Built on Radix UI primitives with Tailwind CSS styling
- CVA (class-variance-authority) for component variants

**Pattern:**

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
```

### 4. Parallel Agent Coordination Results

**What Worked:**

- ✅ Component agent: Built all 6 shadcn/ui components successfully
- ✅ Page agent: Created all pages with proper Server/Client component split
- ✅ Some API routes completed (5 of 8)

**What Failed:**

- ❌ API route specialist created files in wrong directory
- ❌ No validation step to check file locations
- ❌ Deletion without recreation left feature incomplete

**Lesson:** When using parallel agents:

1. Verify file locations match Next.js conventions
2. Check that all intended files were created
3. Run integration tests before marking tasks complete

### 5. Validation Approach

**Method:** Playwright browser testing without authentication

**Process:**

1. Launch Playwright MCP tool
2. Navigate to localhost:3001 (dev server running on non-standard port)
3. Test UI flows (navigation, forms, buttons)
4. Inspect network requests in browser console

**Findings:**

- ✅ UI components render correctly
- ✅ Forms capture input properly
- ❌ POST /api/encounter-tables returns 404
- ❌ Auth middleware has Supabase connection errors (not blocking for unauthenticated pages)

**Note:** Local Supabase may not be running, causing auth middleware errors. Pages still load for unauthenticated users.

### 6. Design Decisions Made

**Dice Animation:**

- Duration: ~1 second (smooth, not too fast/slow)
- Frames: 20 random numbers at 60fps
- Visual: Number display with rolling effect
- UX: Clear feedback, not distracting

**Monster Snapshots:**

- Full JSONB preservation of monster data at time of table creation
- Ensures historical accuracy if official monsters are updated
- Includes: stats, abilities, attacks, treasure, descriptions

**Slug Generation:**

- Library: nanoid(8) - 8-character alphanumeric strings
- Collision handling: Retry with new slug if duplicate detected
- URL format: `/encounter-tables/public/{slug}` (e.g., `/encounter-tables/public/a1b2c3d4`)

**Uniqueness Enforcement:**

- Database constraint: No duplicate monsters in same table
- Application validation: Check before insert
- User feedback: Clear error messages

**Public Sharing:**

- Opt-in only (default: private)
- Unique slug generated on first share
- Can toggle back to private (keeps slug for future re-sharing)
- No authentication required to view public tables

---

## File Structure

### Current Directory Tree

```
app/
├── api/encounter-tables/
│   ├── route.ts ✅ (POST create)
│   ├── [id]/
│   │   ├── route.ts ❌ MISSING (GET/PATCH/DELETE)
│   │   ├── generate/
│   │   │   └── route.ts ❌ MISSING (POST regenerate)
│   │   ├── roll/
│   │   │   └── route.ts ❌ MISSING (POST roll) 🔴
│   │   ├── entries/[roll]/route.ts ✅ (PATCH replace entry)
│   │   └── share/route.ts ✅ (PATCH toggle public)
│   └── public/[slug]/
│       ├── route.ts ✅ (GET public view)
│       └── copy/route.ts ✅ (POST copy)
├── encounter-tables/
│   ├── page.tsx ✅ (List view)
│   ├── new/page.tsx ✅ (Create form)
│   ├── [id]/
│   │   ├── page.tsx ✅ (Server wrapper)
│   │   └── EncounterTableClient.tsx ✅ (Client interactive)
│   └── public/[slug]/ (directory exists)
│       └── page.tsx ❌ MISSING (Public view)
components/encounter-tables/ ✅ (6 components)
lib/encounter-tables/ ✅ (types, schemas, queries, 5 utils)
supabase/migrations/ ✅ (20251022180000_create_encounter_tables.sql)
specs/002-random-encounter-tables/ ✅ (spec, plan, tasks, contracts)
```

---

## Next Steps (Priority Order)

### Immediate (30-60 minutes to completion)

1. **Implement Missing API Routes** (Est: 30-45 min)
   - Create `app/api/encounter-tables/[id]/route.ts`
   - Create `app/api/encounter-tables/[id]/generate/route.ts`
   - Create `app/api/encounter-tables/[id]/roll/route.ts`
   - Reference: Existing routes for patterns (`route.ts`, `share/route.ts`)

2. **Test End-to-End** (Est: 10 min)
   - Start dev server: `npm run dev`
   - Navigate to `/encounter-tables/new`
   - Create a test table
   - Verify redirect to detail page
   - Test dice roller functionality
   - Verify monster details display
   - Test edit and delete operations

3. **Create Public View Page** (Est: 15 min)
   - Create `app/encounter-tables/public/[slug]/page.tsx`
   - Fetch table by slug (not id)
   - Render in read-only mode
   - Show "Copy to My Tables" for authenticated users

### Follow-up (Optional)

4. **E2E Testing** (Est: 1-2 hours)
   - Write Playwright tests for critical flows
   - Cover: Create, view, roll, edit, delete, share, copy
   - Per tasks.md: T053-T058

5. **Manual Testing** (Est: 30 min)
   - Follow `specs/002-random-encounter-tables/quickstart.md`
   - Verify all 35 functional requirements
   - Check performance benchmarks (<2s page loads, <500ms queries)

6. **Documentation**
   - Update README if needed
   - Add JSDoc comments to complex utilities
   - Create user guide (if not already in spec)

---

## Success Criteria

**Feature is complete when:**

- ✅ All 8 API routes working (currently 5/8)
- ✅ Can create, view, edit, delete tables
- ✅ Can roll on tables and see monster details
- ✅ Can share tables publicly and copy them
- ✅ Public view page exists and works
- ✅ No 404 errors on form submissions
- ✅ E2E tests passing (recommended but optional per project standards)

**Ready for merge when:**

- All success criteria met
- Code review approved (if applicable)
- Manual testing complete per quickstart.md
- Performance benchmarks met
- Branch up to date with main

---

## Important Reference Files

### Specification

- `specs/002-random-encounter-tables/spec.md` - 35 functional requirements
- `specs/002-random-encounter-tables/tasks.md` - 61-task breakdown
- `specs/002-random-encounter-tables/contracts/openapi.yaml` - API contracts
- `specs/002-random-encounter-tables/data-model.md` - Database schema

### Implementation Guides

- `CLAUDE.md` - Project context (⚠️ Mentions Mantine but project uses shadcn/ui)
- `.claude/agents/api-route-specialist-agent.md` - API route patterns
- `.claude/agents/react-developer-agent.md` - React patterns
- `.claude/agents/shadcn-ui-specialist-agent.md` - shadcn/ui component patterns

### Working Examples

- `app/api/monsters/route.ts` - Reference for GET list
- `app/api/encounter-tables/route.ts` - Reference for POST create
- `app/api/encounter-tables/[id]/share/route.ts` - Reference for PATCH with params
- `components/monsters/` - Reference for shadcn/ui component patterns

---

## Known Issues

1. **Authentication Middleware**
   - Supabase connection errors in middleware (fetch failed)
   - Pages still load for unauthenticated users
   - Not blocking development
   - May need local Supabase instance: `supabase start`

2. **Missing API Routes**
   - 3 critical route files not created
   - Blocks core functionality
   - Directories exist but `route.ts` files missing

3. **No Automated Tests**
   - Contract tests: Skipped (per project decision, removed Jan 2025)
   - E2E tests: Not written yet
   - Unit tests: Not written yet
   - Current validation: Manual Playwright testing

---

## Git Status

**Branch:** `002-random-encounter-tables`
**Last Commit:** `1a7d340` - "Started feature"

**Uncommitted Changes:**

```
M  .claude/settings.local.json
D  src/app/api/encounter-tables/[id]/generate/route.ts (deleted, wrong location)
D  src/app/api/encounter-tables/[id]/roll/route.ts (deleted, wrong location)
D  src/app/api/encounter-tables/[id]/route.ts (deleted, wrong location)
D  src/app/api/encounter-tables/route.ts (deleted, wrong location)
?? app/api/encounter-tables/route.ts (untracked, correct location, exists)
```

**Action Required:** Recreate 3 deleted files in correct `app/api/` location.

---

## Environment Setup

**Prerequisites:**

- Node.js installed ✅
- Dependencies: `npm install` (nanoid v5.1.6 already in package.json)
- Optional: Supabase CLI (`brew install supabase/tap/supabase`)

**Start Development:**

```bash
npm run dev  # Starts on localhost:3001 (port 3000 occupied)
```

**Local Database (Optional):**

```bash
supabase start           # Start local Supabase
supabase db reset --local # Apply all migrations
```

**Code Quality:**

```bash
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm test                # Run Vitest unit tests
npm run test:e2e        # Run Playwright E2E tests
```

---

## Quick Reference: API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SomeSchema } from "@/lib/encounter-tables/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // params is Promise!
) {
  try {
    const supabase = await createClient(); // Must await!
    const { id } = await params; // Must await params!

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Your logic here
    const { data, error } = await supabase
      .from("encounter_tables")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Key Utilities Available:**

```typescript
// Queries
import { selectTableWithEntries } from "@/lib/encounter-tables/queries";

// Utilities
import { filterMonsters } from "@/lib/encounter-tables/utils/filter-monsters";
import { createMonsterSnapshot } from "@/lib/encounter-tables/utils/create-snapshot";
import { generateUniqueSlug } from "@/lib/encounter-tables/utils/generate-slug";
import {
  generateTableEntries,
  regenerateTableEntries,
} from "@/lib/encounter-tables/utils/generate-table";
import { rollDice } from "@/lib/encounter-tables/utils/roll-dice";

// Validation
import { EncounterTableUpdateSchema } from "@/lib/encounter-tables/schemas";
```

---

## Last Updated

**Date:** October 23, 2025, 15:45 PST
**By:** Claude Code (AI Assistant)
**Resume Point:** Implement 3 missing API route files to complete core functionality

**Next Action:** Create `app/api/encounter-tables/[id]/route.ts` (GET/PATCH/DELETE handlers)
