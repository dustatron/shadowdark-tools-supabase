# Tasks: Create Custom Spell

**Input**: Design documents from `/specs/009-add-create-spell/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ Found: Next.js 15 App Router, TypeScript, Supabase
   → ✅ Structure: web app (app/, components/, lib/)
2. Load optional design documents:
   → ✅ data-model.md: UserSpell entity
   → ✅ contracts/: 5 API endpoints
   → ✅ research.md: Mirror monster pattern, no migrations needed
   → ✅ quickstart.md: 10-step user journey, 85+ checkpoints
3. Generate tasks by category:
   → Setup: Verify DB, create Zod schemas
   → Tests: 5 contract tests, 4 E2E tests
   → Core: API routes, form component, pages
   → Integration: Name uniqueness, RLS verification
   → Polish: Unit tests, performance validation
4. Apply task rules:
   → Contract tests [P] (different files)
   → API routes sequential (may share utilities)
   → Components [P] (different files)
5. Number tasks sequentially (T001-T025)
6. Generate dependency graph
7. Create parallel execution examples
8. ✅ Validation: All contracts have tests, TDD order enforced
9. Return: SUCCESS (25 tasks ready)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router structure:

- API routes: `app/api/spells/`
- Pages: `app/spells/`
- Components: `components/spells/`
- Validation: `lib/validations/`
- Tests: `__tests__/unit/`, `__tests__/e2e/`

---

## Phase 3.1: Setup & Verification

### T001: Verify database schema and RLS policies ✅

**Description**: Verify `user_spells` table exists with all required fields and RLS policies

**Files**:

- Query: `supabase/migrations/20250921000016_create_user_spells.sql`
- Verify: tier CHECK constraint (1-5), RLS policies for SELECT/INSERT/UPDATE/DELETE

**Acceptance**:

- [x] Table `user_spells` exists
- [ ] Columns match data-model.md (id, name, slug, description, classes, duration, range, tier, is_public, user_id, etc.)
- [ ] RLS policies: SELECT (owned OR public), INSERT/UPDATE/DELETE (owned only)
- [ ] Indexes exist for performance

**Commands**:

```bash
# Check table structure
mcp__supabase__list_tables --project_id hvtkkugamifjglxkqsrc

# Verify RLS policies
mcp__supabase__execute_sql --project_id hvtkkugamifjglxkqsrc --query "SELECT * FROM pg_policies WHERE tablename = 'user_spells'"
```

---

### T002: Create Zod validation schemas

**Description**: Create spell validation schemas in `lib/validations/spell.ts`

**Files**:

- Create: `lib/validations/spell.ts`

**Implementation**:

```typescript
import { z } from "zod";

export const spellCreateSchema = z.object({
  name: z.string().min(1, "Name required").max(100),
  tier: z.number().int().min(1).max(5),
  classes: z.array(z.enum(["wizard", "priest"])).min(1),
  duration: z.string().min(1),
  range: z.string().min(1),
  description: z.string().min(1),
  author_notes: z.string().optional(),
  is_public: z.boolean().default(false),
});

export const spellUpdateSchema = spellCreateSchema.partial().extend({
  tier: z.number().int().min(1).max(5).optional(),
});

export type SpellCreate = z.infer<typeof spellCreateSchema>;
export type SpellUpdate = z.infer<typeof spellUpdateSchema>;
```

**Acceptance**:

- [ ] File created at `lib/validations/spell.ts`
- [ ] `spellCreateSchema` validates all required fields
- [ ] `spellUpdateSchema` allows partial updates
- [ ] TypeScript types exported

---

### T003 [P]: Create slug generation utility

**Description**: Create utility to generate URL-friendly slugs from spell names

**Files**:

- Create: `lib/utils/slug.ts`

**Implementation**:

```typescript
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

**Acceptance**:

- [ ] Function handles special characters
- [ ] Spaces converted to hyphens
- [ ] Result is lowercase
- [ ] Example: "Fire Bolt" → "fire-bolt"

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### T004 [P]: Unit test - Zod spell validation

**Description**: Write unit tests for Zod spell schemas

**Files**:

- Create: `__tests__/unit/spell-validation.test.ts`

**Test Cases**:

```typescript
import { describe, it, expect } from "vitest";
import { spellCreateSchema, spellUpdateSchema } from "@/lib/validations/spell";

describe("Spell Validation", () => {
  it("validates valid wizard spell", () => {
    const valid = {
      name: "Test Spell",
      tier: 3,
      classes: ["wizard"],
      duration: "Instantaneous",
      range: "Self",
      description: "Test effect",
      is_public: false,
    };
    expect(() => spellCreateSchema.parse(valid)).not.toThrow();
  });

  it("rejects tier outside 1-5 range", () => {
    const invalid = { ...validSpell, tier: 6 };
    expect(() => spellCreateSchema.parse(invalid)).toThrow();
  });

  it("requires at least one class", () => {
    const invalid = { ...validSpell, classes: [] };
    expect(() => spellCreateSchema.parse(invalid)).toThrow();
  });

  it("allows partial updates", () => {
    const partial = { name: "Updated Name" };
    expect(() => spellUpdateSchema.parse(partial)).not.toThrow();
  });
});
```

**Acceptance**:

- [ ] Tests written and FAIL (no implementation yet)
- [ ] Covers tier validation (1-5)
- [ ] Covers classes validation (non-empty array)
- [ ] Covers required vs optional fields
- [ ] Covers partial updates

---

### T005 [P]: Contract test - POST /api/spells

**Description**: Write contract test for spell creation endpoint

**Files**:

- Create: `__tests__/contract/POST-spells.test.ts`

**Reference**: `specs/009-add-create-spell/contracts/POST-spells.json`

**Test Cases**:

- Valid spell creation returns 201
- Invalid tier returns 400
- Unauthenticated request returns 401
- Duplicate name returns 409

**Acceptance**:

- [ ] Test written and FAILS (endpoint doesn't exist yet)
- [ ] Covers all test scenarios from contract
- [ ] Validates response schema
- [ ] Tests authentication requirement

---

### T006 [P]: Contract test - GET /api/spells

**Description**: Write contract test for listing spells

**Files**:

- Create: `__tests__/contract/GET-spells.test.ts`

**Reference**: `specs/009-add-create-spell/contracts/GET-spells.json`

**Test Cases**:

- Authenticated user sees own + public spells
- Unauthenticated user sees only public spells
- Filters work (tier, class, search)
- Pagination works

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests visibility rules (RLS)
- [ ] Tests filtering
- [ ] Tests pagination

---

### T007 [P]: Contract test - GET /api/spells/[id]

**Description**: Write contract test for getting single spell

**Files**:

- Create: `__tests__/contract/GET-spells-id.test.ts`

**Reference**: `specs/009-add-create-spell/contracts/GET-spells-id.json`

**Test Cases**:

- Public spell visible to all
- Private spell visible to owner only
- Private spell returns 403 to others
- Non-existent spell returns 404

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests ownership visibility
- [ ] Tests 403 vs 404 responses

---

### T008 [P]: Contract test - PUT /api/spells/[id]

**Description**: Write contract test for updating spell

**Files**:

- Create: `__tests__/contract/PUT-spells-id.test.ts`

**Reference**: `specs/009-add-create-spell/contracts/PUT-spells-id.json`

**Test Cases**:

- Owner can update own spell
- Non-owner gets 403
- Invalid data returns 400
- Duplicate name returns 409

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests owner-only access
- [ ] Tests partial updates
- [ ] Tests name uniqueness on update

---

### T009 [P]: Contract test - DELETE /api/spells/[id]

**Description**: Write contract test for deleting spell

**Files**:

- Create: `__tests__/contract/DELETE-spells-id.test.ts`

**Reference**: `specs/009-add-create-spell/contracts/DELETE-spells-id.json`

**Test Cases**:

- Owner can delete own spell
- Non-owner gets 403
- Unauthenticated gets 401
- Returns 204 on success

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests owner-only access
- [ ] Tests 204 response
- [ ] Verifies spell deleted from DB

---

### T010 [P]: E2E test - Create spell flow

**Description**: Write Playwright test for complete spell creation journey

**Files**:

- Create: `__tests__/e2e/spell-create.spec.ts`

**Reference**: `specs/009-add-create-spell/quickstart.md` Steps 1-4

**Test Flow**:

1. Navigate to /spells/create
2. Fill form with valid data
3. Submit form
4. Verify redirect to detail page
5. Verify spell in database

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests auth redirect
- [ ] Tests form validation
- [ ] Tests success flow

---

### T011 [P]: E2E test - Edit spell flow

**Description**: Write Playwright test for editing existing spell

**Files**:

- Create: `__tests__/e2e/spell-edit.spec.ts`

**Reference**: `specs/009-add-create-spell/quickstart.md` Step 6

**Test Flow**:

1. Create spell
2. Navigate to edit page
3. Change fields
4. Submit update
5. Verify changes

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests edit form pre-fill
- [ ] Tests duplicate name validation
- [ ] Tests public/private toggle

---

### T012 [P]: E2E test - Delete spell flow

**Description**: Write Playwright test for deleting spell

**Files**:

- Create: `__tests__/e2e/spell-delete.spec.ts`

**Reference**: `specs/009-add-create-spell/quickstart.md` Step 8

**Test Flow**:

1. Create spell
2. Navigate to detail page
3. Click delete button
4. Confirm deletion
5. Verify redirect and spell gone

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests confirmation dialog
- [ ] Tests successful deletion

---

### T013 [P]: E2E test - Public/private visibility

**Description**: Write Playwright test for spell visibility rules

**Files**:

- Create: `__tests__/e2e/spell-visibility.spec.ts`

**Reference**: `specs/009-add-create-spell/quickstart.md` Step 7

**Test Flow**:

1. Create private spell (user A)
2. Create public spell (user A)
3. Log in as user B
4. Verify can see public, not private
5. Log out
6. Verify can see public only

**Acceptance**:

- [ ] Test written and FAILS
- [ ] Tests multi-user scenario
- [ ] Tests authenticated vs unauthenticated
- [ ] Tests RLS enforcement

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T014: Implement POST /api/spells

**Description**: Create API route for spell creation with name uniqueness check

**Files**:

- Create: `app/api/spells/route.ts` (POST handler)

**Implementation**:

```typescript
export async function POST(request: NextRequest) {
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

  // Validate body
  const body = await request.json();
  const validated = spellCreateSchema.parse(body);

  // Check name uniqueness
  const { data: existing } = await supabase
    .from("all_spells")
    .select("name")
    .ilike("name", validated.name)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Spell name already exists" },
      { status: 409 },
    );
  }

  // Generate slug
  const slug = generateSlug(validated.name);

  // Insert spell
  const { data, error } = await supabase
    .from("user_spells")
    .insert({ ...validated, slug, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create spell" },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
```

**Acceptance**:

- [ ] POST handler implemented
- [ ] Auth check before creation
- [ ] Zod validation applied
- [ ] Name uniqueness checked against all_spells
- [ ] Slug auto-generated
- [ ] Returns 201 with created spell
- [ ] Contract test T005 PASSES

---

### T015: Implement GET /api/spells

**Description**: Create API route for listing spells with filters

**Files**:

- Update: `app/api/spells/route.ts` (add GET handler)

**Implementation**:

```typescript
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase.from("user_spells").select("*");

  // RLS automatically filters: owned OR public

  // Apply filters
  if (searchParams.get("tier")) {
    query = query.eq("tier", parseInt(searchParams.get("tier")!));
  }

  if (searchParams.get("class")) {
    query = query.contains("classes", [searchParams.get("class")]);
  }

  if (searchParams.get("search")) {
    query = query.or(
      `name.ilike.%${searchParams.get("search")}%,description.ilike.%${searchParams.get("search")}%`,
    );
  }

  // Pagination
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch spells" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data, count });
}
```

**Acceptance**:

- [ ] GET handler implemented
- [ ] RLS filters automatically (owned + public)
- [ ] Tier filter works
- [ ] Class filter works
- [ ] Search filter works
- [ ] Pagination works
- [ ] Contract test T006 PASSES

---

### T016: Implement GET /api/spells/[id]

**Description**: Create API route for getting single spell by ID

**Files**:

- Create: `app/api/spells/[id]/route.ts` (GET handler)

**Implementation**:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS handles visibility (owned OR public)
  const { data, error } = await supabase
    .from("user_spells")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Spell not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

**Acceptance**:

- [ ] GET handler implemented
- [ ] Returns single spell
- [ ] RLS enforces visibility
- [ ] Returns 404 if not found
- [ ] Contract test T007 PASSES

---

### T017: Implement PUT /api/spells/[id]

**Description**: Create API route for updating spell with uniqueness check

**Files**:

- Update: `app/api/spells/[id]/route.ts` (add PUT handler)

**Implementation**:

```typescript
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

  // Validate body
  const body = await request.json();
  const validated = spellUpdateSchema.parse(body);

  // If name changed, check uniqueness
  if (validated.name) {
    const { data: existing } = await supabase
      .from("all_spells")
      .select("id, name")
      .ilike("name", validated.name)
      .neq("id", id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Spell name already exists" },
        { status: 409 },
      );
    }

    // Regenerate slug if name changed
    validated.slug = generateSlug(validated.name);
  }

  // RLS enforces ownership
  const { data, error } = await supabase
    .from("user_spells")
    .update(validated)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Acceptance**:

- [ ] PUT handler implemented
- [ ] Auth required
- [ ] Partial update supported
- [ ] Name uniqueness checked (excluding self)
- [ ] Slug regenerated if name changed
- [ ] RLS enforces ownership
- [ ] Contract test T008 PASSES

---

### T018: Implement DELETE /api/spells/[id]

**Description**: Create API route for deleting spell

**Files**:

- Update: `app/api/spells/[id]/route.ts` (add DELETE handler)

**Implementation**:

```typescript
export async function DELETE(
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

  // RLS enforces ownership
  const { error } = await supabase.from("user_spells").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
```

**Acceptance**:

- [ ] DELETE handler implemented
- [ ] Auth required
- [ ] RLS enforces ownership
- [ ] Returns 204 on success
- [ ] Contract test T009 PASSES

---

### T019 [P]: Create SpellForm component

**Description**: Create reusable spell form component with validation

**Files**:

- Create: `components/spells/SpellForm.tsx`

**Reference**: Mirror `components/monsters/MonsterCreateEditForm.tsx` pattern

**Features**:

- react-hook-form with zodResolver
- shadcn/ui Form components
- Tier select (1-5)
- Classes multi-select (wizard, priest)
- Text inputs for duration, range, description
- Optional author_notes
- Public/private toggle
- Submit button with loading state

**Acceptance**:

- [ ] Component created
- [ ] Uses react-hook-form + Zod
- [ ] All fields render correctly
- [ ] Client-side validation works
- [ ] Loading state during submission
- [ ] Error messages display

---

### T020 [P]: Create spell create page

**Description**: Create page for spell creation with auth check

**Files**:

- Create: `app/spells/create/page.tsx`

**Reference**: Mirror `app/monsters/create/page.tsx` pattern

**Implementation**:

```typescript
"use client";

export default function CreateSpellPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Auth check, redirect to login if not authenticated
  }, [router]);

  if (isChecking) return <LoadingSpinner />;
  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Custom Spell</h1>
      <SpellForm mode="create" />
    </div>
  );
}
```

**Acceptance**:

- [ ] Page created
- [ ] Client-side auth check
- [ ] Redirects to login if not authenticated
- [ ] Renders SpellForm component
- [ ] Loading state during auth check

---

### T021 [P]: Create spell edit page

**Description**: Create page for editing existing spell

**Files**:

- Create: `app/spells/[slug]/edit/page.tsx`

**Features**:

- Load existing spell data
- Pre-fill SpellForm
- Auth + ownership check
- Redirect if not owner

**Acceptance**:

- [ ] Page created
- [ ] Loads spell by slug
- [ ] Pre-fills form with existing data
- [ ] Checks ownership
- [ ] Redirects if not owner

---

### T022: Update spell detail page with edit/delete buttons

**Description**: Add edit and delete buttons to spell detail page (owner only)

**Files**:

- Update: `app/spells/[slug]/page.tsx`

**Changes**:

- Check if current user is owner
- Show "Edit" and "Delete" buttons if owner
- Wire up navigation and delete handler

**Acceptance**:

- [ ] Ownership check implemented
- [ ] Edit button shows for owner
- [ ] Delete button shows for owner
- [ ] Buttons hidden for non-owners
- [ ] Delete confirmation dialog

---

## Phase 3.4: Integration & Polish

### T023: Verify RLS policies enforce ownership

**Description**: Manual test that RLS blocks unauthorized access

**Test Cases**:

1. User A creates private spell
2. User B cannot see spell in list
3. User B cannot GET /api/spells/:id (403)
4. User B cannot UPDATE spell (403)
5. User B cannot DELETE spell (403)

**Commands**:

```bash
# Check RLS policies
mcp__supabase__get_advisors --project_id hvtkkugamifjglxkqsrc --type security
```

**Acceptance**:

- [ ] RLS policies enforced at DB level
- [ ] No API-level ownership checks needed
- [ ] Security advisor shows no RLS issues

---

### T024: Performance validation

**Description**: Verify performance targets from plan.md

**Targets**:

- Form submission: < 500ms
- Spell list rendering (1000+ spells): < 2s
- Spell detail page load: < 300ms
- Name uniqueness check: < 100ms

**Tools**:

- Chrome DevTools Network tab
- Lighthouse performance audit

**Acceptance**:

- [ ] Create spell < 500ms
- [ ] List page < 2s
- [ ] Detail page < 300ms
- [ ] All targets met

---

### T025: Execute quickstart validation

**Description**: Run complete quickstart.md user journey

**Reference**: `specs/009-add-create-spell/quickstart.md`

**Steps**: All 10 steps with 85+ validation checkpoints

**Acceptance**:

- [ ] All quickstart steps complete
- [ ] All validation checkboxes pass
- [ ] No console errors
- [ ] E2E tests (T010-T013) PASS

---

## Dependencies

### Critical Path

```
T001 (DB verify) → T002 (Zod schemas) → T004 (unit tests)
                                      → T005-T009 (contract tests)
                                      → T010-T013 (E2E tests)

Tests (T004-T013) MUST FAIL before implementation

T002 → T014-T018 (API routes)
T002 → T019 (SpellForm) → T020-T021 (pages)

T014-T018 → T022 (update detail page)
All implementation → T023-T025 (validation)
```

### Parallel Opportunities

```
# After T002 (Zod schemas), run in parallel:
- T003 (slug utility)
- T004 (unit tests)
- T005-T009 (contract tests) - 5 parallel
- T010-T013 (E2E tests) - 4 parallel

# After API routes done, run in parallel:
- T019 (SpellForm)
- T020 (create page)
- T021 (edit page)
```

### Blocking Rules

- T002 blocks all tests and implementation
- T004-T013 must FAIL before T014-T022
- T014-T018 (API routes) block T020-T021 (pages need endpoints)
- T019 (SpellForm) blocks T020-T021 (pages need form)
- T014-T022 block T023-T025 (validation needs implementation)

---

## Parallel Execution Examples

### After T002 completes, launch contract tests in parallel:

```typescript
// Launch all 5 contract tests simultaneously
Task(
  "Write contract test POST /api/spells in __tests__/contract/POST-spells.test.ts",
);
Task(
  "Write contract test GET /api/spells in __tests__/contract/GET-spells.test.ts",
);
Task(
  "Write contract test GET /api/spells/[id] in __tests__/contract/GET-spells-id.test.ts",
);
Task(
  "Write contract test PUT /api/spells/[id] in __tests__/contract/PUT-spells-id.test.ts",
);
Task(
  "Write contract test DELETE /api/spells/[id] in __tests__/contract/DELETE-spells-id.test.ts",
);
```

### After T002 completes, launch E2E tests in parallel:

```typescript
// Launch all 4 E2E tests simultaneously
Task("Write E2E test for spell creation in __tests__/e2e/spell-create.spec.ts");
Task("Write E2E test for spell editing in __tests__/e2e/spell-edit.spec.ts");
Task("Write E2E test for spell deletion in __tests__/e2e/spell-delete.spec.ts");
Task(
  "Write E2E test for visibility rules in __tests__/e2e/spell-visibility.spec.ts",
);
```

### After API routes complete, launch UI components in parallel:

```typescript
// Launch UI components simultaneously
Task("Create SpellForm component in components/spells/SpellForm.tsx");
Task("Create spell create page in app/spells/create/page.tsx");
Task("Create spell edit page in app/spells/[slug]/edit/page.tsx");
```

---

## Notes

- **[P] tasks**: Different files, no dependencies, safe to parallelize
- **TDD strict**: All tests (T004-T013) must FAIL before implementation
- **No migrations needed**: Database schema complete (research.md)
- **Mirror monster pattern**: Use existing MonsterForm as reference
- **Global uniqueness**: Check `all_spells` view (official + custom)
- **RLS trust**: Let database enforce ownership, minimal API checks

---

## Validation Checklist

_GATE: Verified before task execution_

- [x] All contracts have corresponding tests (T005-T009)
- [x] Entity (UserSpell) has validation schema (T002)
- [x] All tests come before implementation (T004-T013 → T014-T022)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD order enforced (tests MUST FAIL first)
- [x] Quickstart validation included (T025)
- [x] Performance targets defined (T024)
- [x] Security validation included (T023)

---

## Task Summary

**Total Tasks**: 25

- Setup: 3 tasks (T001-T003)
- Tests: 10 tasks (T004-T013) - 9 parallel
- Implementation: 9 tasks (T014-T022) - 3 parallel
- Validation: 3 tasks (T023-T025)

**Estimated Time**: 2-3 days

- Day 1: Setup + Tests (T001-T013)
- Day 2: API routes + Components (T014-T022)
- Day 3: Validation + Polish (T023-T025)

**Critical Success Factors**:

1. Tests written FIRST and FAIL
2. RLS policies verified (T001, T023)
3. Name uniqueness enforced (T014, T017)
4. Quickstart validation passes (T025)
5. All E2E tests pass (T010-T013)
