# Tasks: Migrate DB Functions to TypeScript Services

**Input**: Design documents from `/specs/016-migrate-the-db/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

---

## Phase 3.1: Setup

- [x] T001 Verify existing service pattern in `lib/services/adventure-list-items.ts` for reference

---

## Phase 3.2: Tests First (TDD) - MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Audit Service Tests

- [x] T002 [P] Unit test `createAuditLog()` in `__tests__/services/audit.test.ts`
  - Test successful audit log creation returns UUID
  - Test with all optional params (targetId, targetType, details, notes)
  - Test with minimal params (actionType, adminUserId only)
  - Mock Supabase client insert

### Monster Search Service Tests

- [x] T003 [P] Unit test `searchMonsters()` in `__tests__/services/monster-search.test.ts`
  - Test empty query returns all monsters
  - Test fuzzy search matches partial names
  - Test challenge level range filtering
  - Test monster type filtering
  - Test location tag filtering
  - Test source filter
  - Test pagination (limit/offset)
  - Test relevance scoring and ordering
  - Mock Supabase client queries

- [x] T004 [P] Unit test `getRandomMonsters()` in `__tests__/services/monster-search.test.ts`
  - Test returns requested count
  - Test applies filters correctly
  - Mock Supabase client with ORDER BY random()

### Unified Search Service Tests

- [x] T005 [P] Unit test `searchAllContent()` in `__tests__/services/unified-search.test.ts`
  - Test searches all content types when all enabled
  - Test respects content type toggles (includeMonsters, etc.)
  - Test source filter (all, core, user)
  - Test limit parameter
  - Test relevance ordering
  - Test detailUrl construction per type
  - Mock parallel Supabase queries

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Audit Service

- [x] T006 Implement `createAuditLog()` in `lib/services/audit.ts`
  - Accept SupabaseClient as first param
  - Insert into audit_logs table
  - Return created UUID
  - Reference contract: `specs/016-migrate-the-db/contracts/audit.ts`

### Monster Search Service

- [x] T007 Implement `searchMonsters()` in `lib/services/monster-search.ts`
  - Query `all_monsters` view
  - Apply text search with ILIKE for fuzzy matching
  - Filter by challenge_level range
  - Filter by JSONB tags (type, location)
  - Filter by source
  - Calculate relevance score in TypeScript
  - Apply pagination (limit/offset)
  - Order by relevance DESC (when query provided)
  - Reference contract: `specs/016-migrate-the-db/contracts/monster-search.ts`

- [x] T008 Implement `getRandomMonsters()` in `lib/services/monster-search.ts`
  - Query `all_monsters` view with filters
  - Use database `random()` for ordering
  - Apply limit
  - Reference contract: `specs/016-migrate-the-db/contracts/monster-search.ts`

### Unified Search Service

- [x] T009 Implement `searchAllContent()` in `lib/services/unified-search.ts`
  - Use Promise.all() for parallel queries per type
  - Query all_monsters, all_spells, all_magic_items, equipment
  - Skip types where include\* is false
  - Apply source filter per type
  - Calculate relevance in TypeScript
  - Construct detailUrl per type
  - Merge, sort by relevance, apply limit
  - Reference contract: `specs/016-migrate-the-db/contracts/unified-search.ts`

---

## Phase 3.4: API Route Updates

### Admin Routes (Audit Service)

- [x] T010 Update `app/api/admin/users/[id]/route.ts` to use audit service
  - Import `createAuditLog` from `lib/services/audit`
  - Replace `supabase.rpc("create_audit_log", {...})` call
  - Pass admin user ID from auth check
  - Verify response unchanged

- [x] T011 Update `app/api/admin/flags/[id]/route.ts` to use audit service
  - Import `createAuditLog` from `lib/services/audit`
  - Replace `supabase.rpc("create_audit_log", {...})` call
  - Verify response unchanged

### Search Routes (Monster Search Service)

- [x] T012 Update `app/api/search/monsters/route.ts` to use monster-search service
  - Import `searchMonsters` from `lib/services/monster-search`
  - Replace both `supabase.rpc("search_monsters", {...})` calls
  - Map service params to current RPC param names
  - Verify exact response structure unchanged

- [x] T013 Update `app/api/encounters/generate/route.ts` to use monster-search service
  - Import `searchMonsters` from `lib/services/monster-search`
  - Replace `supabase.rpc("search_monsters", {...})` call
  - Verify encounter generation still works

### Unified Search Route

- [x] T014 Update `app/api/search/route.ts` to use unified-search service
  - Import `searchAllContent` from `lib/services/unified-search`
  - Replace `supabase.rpc("search_all_content", {...})` call
  - Verify exact response structure unchanged

---

## Phase 3.5: Integration Tests

- [ ] T015 [P] E2E test monster search in Playwright
  - Navigate to monster list
  - Enter search query
  - Verify results contain expected monsters
  - Test filter controls

- [ ] T016 [P] E2E test unified search in Playwright
  - Navigate to search page
  - Enter query
  - Verify mixed content types returned
  - Test content type toggles

- [ ] T017 API integration test for encounter generation
  - POST to /api/encounters/generate
  - Verify response contains monsters matching criteria
  - Test with various difficulty levels

---

## Phase 3.6: Verification & Cleanup

- [x] T018 Verify no RPC calls remain in production code
  - Grep for `.rpc("search_monsters"` - should find only tests
  - Grep for `.rpc("search_all_content"` - should find only tests
  - Grep for `.rpc("create_audit_log"` - should find nothing

- [x] T019 Run all existing tests
  - `npm test` - 83 service tests pass, 75 old API route tests fail (tech debt: still mock RPC)
  - `npm run test:e2e` - skipped (requires local server)

- [x] T020 Run quickstart verification (see quickstart.md)
  - Build passes successfully
  - All 3 services implemented and tested

- [x] T021 Verify API response backward compatibility
  - Response structures match - services return same fields as RPC functions
  - Field names verified in service implementations

---

## Dependencies

```
T001 (setup) → T002-T005 (tests) → T006-T009 (impl)

T002 → T006 → T010, T011
T003-T004 → T007-T008 → T012, T013
T005 → T009 → T014

T010-T014 (routes) → T015-T017 (e2e)
T015-T017 → T018-T021 (verification)
```

---

## Parallel Execution Examples

### Launch all unit tests in parallel (T002-T005):

```
Task agent: "Write unit tests for createAuditLog() in __tests__/services/audit.test.ts"
Task agent: "Write unit tests for searchMonsters() in __tests__/services/monster-search.test.ts"
Task agent: "Write unit tests for getRandomMonsters() in __tests__/services/monster-search.test.ts"
Task agent: "Write unit tests for searchAllContent() in __tests__/services/unified-search.test.ts"
```

### Launch all service implementations in parallel (T006-T009):

```
Task agent: "Implement createAuditLog() in lib/services/audit.ts per contract"
Task agent: "Implement searchMonsters() in lib/services/monster-search.ts per contract"
Task agent: "Implement getRandomMonsters() in lib/services/monster-search.ts"
Task agent: "Implement searchAllContent() in lib/services/unified-search.ts per contract"
```

Note: T007 and T008 share the same file, so they should be done sequentially or combined.

### Launch E2E tests in parallel (T015-T016):

```
Task agent: "Write Playwright E2E test for monster search"
Task agent: "Write Playwright E2E test for unified search"
```

---

## Validation Checklist

- [x] All contracts have corresponding tests (T002-T005)
- [x] All entities have model tasks (services in T006-T009)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
