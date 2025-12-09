# Implementation Plan: Central Home Page Search

**Branch**: `014-turn-the-home` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-turn-the-home/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path ✓
2. Fill Technical Context ✓
3. Fill Constitution Check section ✓
4. Evaluate Constitution Check ✓ PASS
5. Execute Phase 0 → research.md ✓
6. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
7. Re-evaluate Constitution Check ✓ PASS
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command ✓
```

## Summary

Transform home page from feature cards to unified search interface. Single search box with fuzzy matching across monsters, magic items, and equipment. Includes source filter (All/Core/User), content type checkboxes, and configurable result limits (25/50/100). Clicking results navigates to appropriate detail pages.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15
**Primary Dependencies**: shadcn/ui, @tanstack/react-query, Zod, react-hook-form
**Storage**: Supabase PostgreSQL with pg_trgm extension
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web (Next.js App Router)
**Performance Goals**: Search results <500ms, page load <2s
**Constraints**: Min 3 char search, result limits 25/50/100
**Scale/Scope**: ~500 monsters, ~100 magic items, ~100 equipment items

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First

- [x] **PASS**: Search form as reusable component (`UnifiedSearchForm`)
- [x] **PASS**: Search results as separate component (`SearchResultsList`)
- [x] **PASS**: Result item as reusable component (`SearchResultCard`)

### II. API-First

- [x] **PASS**: Single `/api/search` endpoint with OpenAPI contract
- [x] **PASS**: Consistent JSON request/response patterns
- [x] **PASS**: Proper HTTP status codes (200, 400, 500)

### III. Test-First (NON-NEGOTIABLE)

- [x] **PASS**: E2E tests for search scenarios in quickstart.md
- [x] **PASS**: Unit tests for API route handler
- [x] **PASS**: Component tests for form validation

### IV. Integration Testing

- [x] **PASS**: Database search function testing required
- [x] **PASS**: API endpoint integration tests

### V. Simplicity

- [x] **PASS**: Single API endpoint (not three separate)
- [x] **PASS**: Reuses existing pg_trgm indexes
- [x] **PASS**: No new dependencies required

### VI. Data Integrity

- [x] **PASS**: Zod validation for search parameters
- [x] **PASS**: Database-level fuzzy search with consistent scoring

### VII. Community Safety

- [x] **N/A**: Search is read-only, no content creation

## Project Structure

### Documentation (this feature)

```
specs/014-turn-the-home/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── search-api.yaml  # OpenAPI spec
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)

```
app/
├── page.tsx                    # MODIFY: Replace with search UI
└── api/
    └── search/
        └── route.ts            # NEW: Unified search endpoint

components/
├── search/
│   ├── UnifiedSearchForm.tsx   # NEW: Search form with filters
│   ├── SearchResultsList.tsx   # NEW: Results display
│   └── SearchResultCard.tsx    # NEW: Individual result item

lib/
├── validations/
│   └── search.ts               # NEW: Zod schemas

supabase/
└── migrations/
    └── YYYYMMDD_create_search_all_content.sql  # NEW: DB function
```

**Structure Decision**: Web application (Next.js App Router)

## Phase 0: Outline & Research

**Completed** - See [research.md](./research.md)

Key findings:

- Existing tables: `all_monsters`, `all_magic_items`, `equipment`
- Existing fuzzy search with pg_trgm extension
- Detail routes: `/monsters/[id]`, `/magic-items/[slug]`, `/equipment/[id]`
- Create unified `search_all_content()` PostgreSQL function

## Phase 1: Design & Contracts

**Completed** - See:

- [data-model.md](./data-model.md) - SearchResult, SearchFilters, SearchResponse
- [contracts/search-api.yaml](./contracts/search-api.yaml) - OpenAPI spec
- [quickstart.md](./quickstart.md) - Verification scenarios

Key design decisions:

1. Single `/api/search` endpoint
2. Database-level UNION ALL query for performance
3. Unified SearchResult type with type discriminator
4. Form submit (not live search) per user request

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Database Tasks**:
   - Create `search_all_content()` PostgreSQL function
   - Add pg_trgm index on equipment.name if missing

2. **API Tasks** (TDD):
   - Write failing tests for `/api/search` route
   - Implement search route handler
   - Add Zod validation schema

3. **Component Tasks** (TDD):
   - Write failing tests for UnifiedSearchForm
   - Implement UnifiedSearchForm component
   - Write failing tests for SearchResultCard
   - Implement SearchResultCard component
   - Write failing tests for SearchResultsList
   - Implement SearchResultsList component

4. **Integration Tasks**:
   - Replace home page with search UI
   - Wire up form submission to API
   - Add navigation on result click

5. **E2E Tasks**:
   - Playwright tests for search scenarios

**Ordering Strategy**:

- Database first (function must exist)
- API next (backend before frontend)
- Components (can be parallel)
- Integration (depends on components)
- E2E last (validates full flow)

**Estimated Output**: ~20 numbered, ordered tasks in tasks.md

## Complexity Tracking

_No violations identified_

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
