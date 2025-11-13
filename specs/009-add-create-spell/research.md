# Research: Create Custom Spell

**Date**: 2025-11-12
**Feature**: 009-add-create-spell

## Research Questions & Findings

### 1. Database Schema Analysis

**Question**: Does the `user_spells` table have the required structure for spell creation?

**Finding**: ✅ YES - Table exists with comprehensive structure

**Schema Details** (from `20250921000016_create_user_spells.sql`):

```sql
CREATE TABLE public.user_spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,  -- Maps to "effect" in requirements
    classes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of wizard/priest
    duration TEXT NOT NULL,
    range TEXT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 5),  -- Shadowdark validation
    source TEXT NOT NULL DEFAULT 'Custom',
    author_notes TEXT,  -- Optional school/notes
    icon_url TEXT,  -- Exists but won't be used (no image upload)
    art_url TEXT,   -- Exists but won't be used (no image upload)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,  -- Privacy toggle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, slug)  -- Unique per user, not globally unique
);
```

**Gap Identified**: ❌ Name uniqueness constraint missing

- Current: UNIQUE(user_id, slug) - only unique per user
- Required: Globally unique names across all_spells view
- **Action Required**: Add global uniqueness check in application layer (API validation)

**RLS Policies** (from same migration):

- ✅ SELECT: user_id = auth.uid() OR is_public = true
- ✅ INSERT: user_id = auth.uid()
- ✅ UPDATE: user_id = auth.uid()
- ✅ DELETE: user_id = auth.uid()
- ✅ Admin policies exist

**Decision**: Use existing table, add application-level name uniqueness validation

**Rationale**:

- Table structure matches requirements (description = effect)
- RLS policies already enforce owner-only CRUD
- Public/private toggle exists
- Tier validation enforced at DB level
- Global name uniqueness best handled in application (check all_spells view before insert/update)

---

### 2. Monster Form Pattern Analysis

**Question**: How does monster creation handle form validation, submission, and user experience?

**Finding**: Monster creation uses client component with auth check

**Pattern from** `app/monsters/create/page.tsx`:

```typescript
"use client";

// Auth check in useEffect
useEffect(() => {
  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=" + encodeURIComponent("/monsters/create"));
    } else {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  };
  checkAuth();
}, [router]);

// Render MonsterCreateEditForm component
<MonsterCreateEditForm mode="create" />
```

**Key Patterns to Replicate**:

1. **Client Component**: Use 'use client' for auth checks
2. **Auth Redirect**: Redirect to login with return URL if not authenticated
3. **Loading State**: Show spinner during auth check
4. **Reusable Form**: Separate form component (SpellCreateEditForm) with mode prop
5. **Protected Route**: Client-side auth check (simpler than middleware for single page)

**Decision**: Mirror monster pattern exactly for spell creation

**Rationale**:

- Proven UX pattern users already familiar with
- Consistent authentication flow
- Reusable form component for create/edit modes
- Simple client-side protection sufficient for form pages

---

### 3. API Route Pattern Analysis

**Question**: How are monster API routes structured for CRUD operations?

**Finding**: Monster API uses Next.js 15 patterns with proper async handling

**Pattern from** `app/api/monsters/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// POST /api/monsters - Create monster
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(); // Must await

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validated = MonsterSchema.parse(body); // Zod validation

    // Insert with user_id
    const { data, error } = await supabase
      .from("user_monsters")
      .insert({ ...validated, user_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create monster" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

**Pattern from** `app/api/monsters/[id]/route.ts`:

```typescript
// GET /api/monsters/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Async params in Next.js 15
) {
  const { id } = await params; // Must await params
  const supabase = await createClient(); // Must await

  // RLS handles visibility (public OR owned by user)
  const { data, error } = await supabase
    .from("user_monsters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/monsters/[id] - Update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const validated = MonsterUpdateSchema.parse(body);

  // RLS enforces user_id match
  const { data, error } = await supabase
    .from("user_monsters")
    .update(validated)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/monsters/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // RLS enforces ownership
  const { error } = await supabase.from("user_monsters").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
```

**Key Patterns to Replicate**:

1. **Async Params**: `{ params }: { params: Promise<{ id: string }> }` and `await params`
2. **Await createClient**: `const supabase = await createClient()`
3. **Auth Before Mutations**: Check user exists before POST/PUT/DELETE
4. **Zod Validation**: Parse body with Zod schemas, catch ZodError
5. **RLS Trust**: Let RLS enforce ownership on UPDATE/DELETE (no manual user_id check needed)
6. **Status Codes**: 201 (created), 200 (success), 204 (deleted), 400 (validation), 401 (auth), 404 (not found), 500 (error)

**Decision**: Mirror monster API patterns exactly for spell routes

**Rationale**:

- Proven Next.js 15 compatibility
- Proper async handling throughout
- Consistent error handling and status codes
- RLS policies eliminate need for manual auth checks on queries

---

### 4. Validation Strategy

**Question**: How should Zod schemas be structured for spell validation?

**Finding**: Need Zod schemas matching Shadowdark spell rules

**Requirements from Spec**:

- Name: string, non-empty, globally unique (checked in API)
- Tier: integer, 1-5 (Shadowdark tiers)
- Classes: array of "wizard" | "priest" (can be both)
- Duration: string (free text - Shadowdark allows flexibility)
- Range: string (free text - Shadowdark allows flexibility)
- Effect (description): string, non-empty
- School (author_notes): optional string
- is_public: boolean, defaults to false

**Decision**: Create Zod schemas in `lib/validations/spell.ts`

**Schema Design**:

```typescript
import { z } from "zod";

// Base spell fields shared between create and update
const baseSpellSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  tier: z.number().int().min(1).max(5, "Tier must be between 1 and 5"),
  classes: z
    .array(z.enum(["wizard", "priest"]))
    .min(1, "At least one class required"),
  duration: z.string().min(1, "Duration is required"),
  range: z.string().min(1, "Range is required"),
  description: z.string().min(1, "Effect description is required"), // Maps to description field
  author_notes: z.string().optional(), // Optional school/notes
  is_public: z.boolean().default(false),
});

// Create spell schema (all fields required except optional ones)
export const spellCreateSchema = baseSpellSchema.extend({
  // slug will be auto-generated from name in API
});

// Update spell schema (all fields optional except constraints)
export const spellUpdateSchema = baseSpellSchema.partial().extend({
  tier: z.number().int().min(1).max(5).optional(), // Maintain constraint when provided
});

export type SpellCreate = z.infer<typeof spellCreateSchema>;
export type SpellUpdate = z.infer<typeof spellUpdateSchema>;
```

**Rationale**:

- Tier validation matches database CHECK constraint
- Classes as enum array prevents typos
- Duration/Range as free text matches Shadowdark flexibility
- Partial schema for updates allows field-level updates
- Type inference provides TypeScript safety

---

## Summary of Decisions

| Area                | Decision                                           | Rationale                                         |
| ------------------- | -------------------------------------------------- | ------------------------------------------------- |
| **Database**        | Use existing `user_spells` table                   | Already has all required fields and RLS policies  |
| **Name Uniqueness** | Application-level validation via `all_spells` view | Check before insert/update, not DB constraint     |
| **Page Structure**  | Mirror `app/monsters/create/page.tsx`              | Client component with auth check, proven pattern  |
| **Form Component**  | Create `SpellCreateEditForm` with mode prop        | Reusable for create/edit, matches monster pattern |
| **API Routes**      | Mirror `/api/monsters` structure                   | Consistent REST patterns, Next.js 15 compliance   |
| **Validation**      | Zod schemas in `lib/validations/spell.ts`          | Type-safe, matches Shadowdark rules               |
| **Auth Strategy**   | Client-side check + RLS enforcement                | Simple, consistent with monster creation          |

## Implementation Notes

1. **Field Mapping**:
   - Spec "effect" → DB "description"
   - Spec "school" → DB "author_notes" (optional)
   - Classes stored as JSONB array

2. **Global Uniqueness**:
   - Check `all_spells` view before insert: `SELECT 1 FROM all_spells WHERE LOWER(name) = LOWER($1)`
   - Return 409 Conflict if exists
   - Case-insensitive comparison

3. **Slug Generation**:
   - Auto-generate from name: `name.toLowerCase().replace(/\s+/g, '-')`
   - Ensures UNIQUE(user_id, slug) constraint satisfied

4. **No Additional Migrations Needed**:
   - Table structure complete
   - RLS policies complete
   - Indexes exist for performance

## Alternatives Considered

| Alternative                                     | Rejected Because                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Database-level global unique constraint on name | Would require migration, harder to provide friendly error messages |
| Server actions instead of API routes            | Monster pattern uses API routes, maintain consistency              |
| Middleware auth protection                      | Overkill for single create page, client check simpler              |
| Separate school field                           | Can reuse author_notes field, avoid schema changes                 |

## Next Steps

Phase 1 will generate:

- `data-model.md` - Entity definitions
- `contracts/*.json` - API endpoint specifications
- `quickstart.md` - User journey validation
- Zod schemas and contract tests
- Updated `CLAUDE.md` with spell context
