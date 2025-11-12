# Tasks: Dungeon Exchange Web Application

**Input**: Design documents from `/specs/001-create-a-plan/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ COMPLETE: Next.js + Supabase + Mantine stack identified
2. Load optional design documents:
   → ✅ COMPLETE: data-model.md: 10 entities extracted → model tasks
   → ✅ COMPLETE: contracts/: 2 API files → contract test tasks
   → ✅ COMPLETE: research.md: Technology decisions → setup tasks
   → ✅ COMPLETE: quickstart.md: 10 scenarios → integration tests
3. Generate tasks by category:
   → ✅ COMPLETE: Setup, Tests, Core, Integration, Polish
4. Apply task rules:
   → ✅ COMPLETE: Different files marked [P], same file sequential, TDD order
5. Number tasks sequentially (T001-T045)
6. Generate dependency graph and parallel examples
7. ✅ SUCCESS: 45 tasks ready for execution
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router Structure**: `app/`, `components/`, `lib/` at repository root
- **Database**: Supabase migrations in `supabase/migrations/`
- **Tests**: `__tests__/` following Next.js conventions
- **Starter Data**: Official monsters from `starter-data/monsters.json` (243 Shadowdark Core monsters)

## Phase 3.1: Setup & Database

- [x] T001 Install required dependencies (Supabase, Mantine UI, Zod, React Hook Form, Vitest, Playwright)
- [x] T002 Configure Supabase project and environment variables
- [x] T003 [P] Setup ESLint and Prettier configuration
- [x] T004 [P] Configure Vitest for unit testing
- [x] T005 [P] Configure Playwright for E2E testing
- [x] T006 Create Supabase database migration for user_profiles table
- [x] T007 Create Supabase database migration for official_monsters table
- [x] T008 Create Supabase database migration for user_monsters table
- [x] T009 Create Supabase database migration for user_groups table
- [x] T010 Create Supabase database migration for user_lists and list_items tables
- [x] T011 Create Supabase database migration for encounter_tables and encounter_slots tables
- [x] T012 Create Supabase database migration for flags and audit_logs tables
- [x] T013 Create Supabase database migration for tag_types and tag_locations tables
- [x] T014 Create Supabase database migration for user_favorites table
- [x] T015 Create all_monsters database view combining official and public custom monsters
- [x] T016 Setup Row Level Security (RLS) policies for all tables
- [x] T017 Create database indexes for performance optimization
- [x] T017.1 BONUS: Create official monsters seed migration from starter-data/monsters.json (243 monsters)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
**NOTE: All UI component tests updated to use Mantine components instead of shadcn/ui**

### Contract Tests

- [ ] T018 [P] Contract test GET /api/monsters in **tests**/api/monsters-get.test.ts
- [ ] T019 [P] Contract test POST /api/monsters in **tests**/api/monsters-post.test.ts
- [ ] T020 [P] Contract test GET /api/monsters/{id} in **tests**/api/monsters-id-get.test.ts
- [ ] T021 [P] Contract test PUT /api/monsters/{id} in **tests**/api/monsters-id-put.test.ts
- [ ] T022 [P] Contract test DELETE /api/monsters/{id} in **tests**/api/monsters-id-delete.test.ts
- [ ] T023 [P] Contract test POST /api/monsters/{id}/copy in **tests**/api/monsters-copy.test.ts
- [ ] T024 [P] Contract test GET /api/monsters/random in **tests**/api/monsters-random.test.ts
- [ ] T025 [P] Contract test GET /api/lists in **tests**/api/lists-get.test.ts
- [ ] T026 [P] Contract test POST /api/lists in **tests**/api/lists-post.test.ts
- [ ] T027 [P] Contract test GET /api/lists/{id} in **tests**/api/lists-id-get.test.ts
- [ ] T028 [P] Contract test PUT /api/lists/{id} in **tests**/api/lists-id-put.test.ts
- [ ] T029 [P] Contract test DELETE /api/lists/{id} in **tests**/api/lists-id-delete.test.ts
- [ ] T030 [P] Contract test POST /api/lists/{id}/items in **tests**/api/lists-items-post.test.ts

### Integration Tests

- [ ] T031 [P] Integration test user registration and authentication in **tests**/integration/auth.test.ts
- [ ] T032 [P] Integration test monster search and discovery in **tests**/integration/monster-search.test.ts
- [ ] T033 [P] Integration test custom monster creation in **tests**/integration/monster-creation.test.ts
- [ ] T034 [P] Integration test list management in **tests**/integration/list-management.test.ts
- [ ] T035 [P] Integration test encounter table generation in **tests**/integration/encounter-generation.test.ts
- [ ] T036 [P] Integration test community features in **tests**/integration/community.test.ts
- [ ] T037 [P] Integration test guest user experience in **tests**/integration/guest-experience.test.ts
- [ ] T038 [P] Integration test admin dashboard in **tests**/integration/admin-dashboard.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Validation & Types

- [ ] T039 Create Zod schemas for monster validation in lib/validations/monster.ts
- [ ] T040 Create Zod schemas for list validation in lib/validations/list.ts
- [ ] T041 Create TypeScript types for all entities in lib/types/database.ts

### Supabase Configuration

- [ ] T042 Configure Supabase client for browser in lib/supabase/client.ts
- [ ] T043 Configure Supabase client for server in lib/supabase/server.ts
- [ ] T044 Create authentication helpers in lib/auth/helpers.ts

### API Routes

- [ ] T045 Implement GET /api/monsters endpoint in app/api/monsters/route.ts
- [ ] T046 Implement POST /api/monsters endpoint in app/api/monsters/route.ts
- [ ] T047 Implement GET /api/monsters/[id] endpoint in app/api/monsters/[id]/route.ts
- [ ] T048 Implement PUT /api/monsters/[id] endpoint in app/api/monsters/[id]/route.ts
- [ ] T049 Implement DELETE /api/monsters/[id] endpoint in app/api/monsters/[id]/route.ts
- [ ] T050 Implement POST /api/monsters/[id]/copy endpoint in app/api/monsters/[id]/copy/route.ts
- [ ] T051 Implement GET /api/monsters/random endpoint in app/api/monsters/random/route.ts
- [ ] T052 Implement GET /api/lists endpoint in app/api/lists/route.ts
- [ ] T053 Implement POST /api/lists endpoint in app/api/lists/route.ts
- [ ] T054 Implement GET /api/lists/[id] endpoint in app/api/lists/[id]/route.ts
- [ ] T055 Implement PUT /api/lists/[id] endpoint in app/api/lists/[id]/route.ts
- [ ] T056 Implement DELETE /api/lists/[id] endpoint in app/api/lists/[id]/route.ts
- [ ] T057 Implement POST /api/lists/[id]/items endpoint in app/api/lists/[id]/items/route.ts

### UI Components (Mantine)

- [ ] T058 [P] Create MonsterCard component using Mantine Card in components/monsters/monster-card.tsx
- [ ] T059 [P] Create MonsterSearch component using Mantine TextInput and Select in components/monsters/monster-search.tsx
- [ ] T060 [P] Create MonsterForm component using Mantine Form and inputs in components/monsters/monster-form.tsx
- [ ] T061 [P] Create MonsterDetails component using Mantine Paper and Text in components/monsters/monster-details.tsx
- [ ] T062 [P] Create ListCard component using Mantine Card in components/lists/list-card.tsx
- [ ] T063 [P] Create ListForm component using Mantine Form in components/lists/list-form.tsx
- [ ] T064 [P] Create ListManager component using Mantine Table and ActionIcon in components/lists/list-manager.tsx
- [ ] T065 [P] Create EncounterTable component using Mantine Table in components/encounters/encounter-table.tsx
- [ ] T066 [P] Create EncounterGenerator component using Mantine Button and Modal in components/encounters/encounter-generator.tsx

### App Router Pages

- [ ] T067 Create main dashboard page in app/dashboard/page.tsx
- [ ] T068 Create monster search page in app/monsters/page.tsx
- [ ] T069 Create monster details page in app/monsters/[id]/page.tsx
- [ ] T070 Create monster creation page in app/monsters/create/page.tsx
- [ ] T071 Create monster edit page in app/monsters/[id]/edit/page.tsx
- [ ] T072 Create lists management page in app/lists/page.tsx
- [ ] T073 Create list details page in app/lists/[id]/page.tsx
- [ ] T074 Create encounters page in app/encounters/page.tsx
- [ ] T075 Create community page in app/community/page.tsx
- [ ] T076 Create admin dashboard page in app/admin/page.tsx

## Phase 3.4: Advanced Features

- [ ] T077 Implement fuzzy search functionality using pg_trgm in lib/search/fuzzy-search.ts
- [ ] T078 Create monster import script for official data in scripts/import-monsters.ts
- [ ] T079 Implement image upload integration with Cloudinary in lib/upload/cloudinary.ts
- [ ] T080 Create group management functionality using Mantine components in components/groups/group-manager.tsx
- [ ] T081 Implement encounter table generation logic in lib/encounters/table-generator.ts
- [ ] T082 Create content flagging system using Mantine Modal and Form in components/moderation/flag-form.tsx
- [ ] T083 Implement admin moderation dashboard using Mantine DataGrid in components/admin/moderation-dashboard.tsx
- [ ] T084 Create guest user session management in lib/auth/guest-session.ts

## Phase 3.5: Integration & Middleware

- [ ] T085 Update middleware.ts for authentication and admin route protection
- [ ] T086 Implement error handling and logging middleware
- [ ] T087 Create database connection pooling optimization
- [ ] T088 Implement caching strategy for frequently accessed data

## Phase 3.6: Polish & Testing

- [ ] T089 [P] Unit tests for monster validation in **tests**/unit/monster-validation.test.ts
- [ ] T090 [P] Unit tests for search functionality in **tests**/unit/search.test.ts
- [ ] T091 [P] Unit tests for encounter generation in **tests**/unit/encounter-generation.test.ts
- [ ] T092 [P] Performance tests for search endpoints in **tests**/performance/search-performance.test.ts
- [ ] T093 [P] E2E tests using Playwright in **tests**/e2e/full-workflow.spec.ts
- [ ] T094 [P] Create API documentation in docs/api.md
- [ ] T095 [P] Create user guide documentation in docs/user-guide.md
- [ ] T096 Add responsive design optimizations using Mantine responsive utilities
- [ ] T097 Implement dark mode using Mantine ColorSchemeProvider
- [ ] T098 Create data export functionality (JSON/Markdown)
- [ ] T099 Implement print-friendly views using Mantine styles
- [ ] T100 Final code review and refactoring

## Dependencies

### Critical Path Dependencies

- **Setup Phase (T001-T017)** blocks all other phases
- **Database migrations (T006-T017)** must complete before API routes (T045-T057)
- **Contract tests (T018-T030)** must FAIL before implementation begins
- **Integration tests (T031-T038)** must FAIL before implementation begins
- **Validation schemas (T039-T041)** block API routes implementation
- **Supabase configuration (T042-T044)** blocks API routes and authentication

### Implementation Dependencies

- T039-T041 (validation) → T045-T057 (API routes)
- T042-T044 (Supabase config) → T045-T057 (API routes)
- T045-T057 (API routes) → T058-T076 (UI components and pages)
- T077-T084 (advanced features) depend on core API routes
- T085-T088 (integration) depend on API routes and UI components
- T089-T100 (polish) come after all core implementation

## Parallel Execution Examples

### Phase 3.1 Setup (Parallel)

```bash
# These can run simultaneously:
Task: "Configure ESLint and Prettier configuration"
Task: "Configure Vitest for unit testing"
Task: "Configure Playwright for E2E testing"
```

### Phase 3.2 Contract Tests (Parallel)

```bash
# All contract tests can run simultaneously:
Task: "Contract test GET /api/monsters in __tests__/api/monsters-get.test.ts"
Task: "Contract test POST /api/monsters in __tests__/api/monsters-post.test.ts"
Task: "Contract test GET /api/monsters/{id} in __tests__/api/monsters-id-get.test.ts"
Task: "Contract test PUT /api/monsters/{id} in __tests__/api/monsters-id-put.test.ts"
Task: "Contract test DELETE /api/monsters/{id} in __tests__/api/monsters-id-delete.test.ts"
```

### Phase 3.2 Integration Tests (Parallel)

```bash
# All integration tests can run simultaneously:
Task: "Integration test user registration and authentication in __tests__/integration/auth.test.ts"
Task: "Integration test monster search and discovery in __tests__/integration/monster-search.test.ts"
Task: "Integration test custom monster creation in __tests__/integration/monster-creation.test.ts"
Task: "Integration test list management in __tests__/integration/list-management.test.ts"
Task: "Integration test encounter table generation in __tests__/integration/encounter-generation.test.ts"
```

### Phase 3.3 UI Components (Parallel)

```bash
# UI components in different files can run simultaneously:
Task: "Create MonsterCard component in components/monsters/monster-card.tsx"
Task: "Create ListCard component in components/lists/list-card.tsx"
Task: "Create EncounterTable component in components/encounters/encounter-table.tsx"
```

### Phase 3.6 Polish (Parallel)

```bash
# Final polish tasks can run simultaneously:
Task: "Unit tests for monster validation in __tests__/unit/monster-validation.test.ts"
Task: "Unit tests for search functionality in __tests__/unit/search.test.ts"
Task: "Performance tests for search endpoints in __tests__/performance/search-performance.test.ts"
Task: "Create API documentation in docs/api.md"
Task: "Create user guide documentation in docs/user-guide.md"
```

## Notes

- **[P] tasks** = different files, no dependencies between them
- **TDD requirement**: Verify all tests FAIL before implementing corresponding features
- **Constitutional compliance**: Each task follows component-first, API-first, and test-first principles
- **File paths**: All paths are relative to repository root
- **Commit strategy**: Commit after completing each task for clear history
- **Performance targets**: Keep page loads <2s, search results <500ms

## Task Generation Rules Applied

1. **From Contracts**:
   - monsters-api.yaml → 7 contract test tasks (T018-T024)
   - lists-api.yaml → 6 contract test tasks (T025-T030)
   - Each endpoint → corresponding implementation task

2. **From Data Model**:
   - 10 entities → database migration tasks (T006-T014)
   - Validation schemas → Zod schema tasks (T039-T041)
   - API endpoints → route implementation tasks (T045-T057)

3. **From Quickstart Scenarios**:
   - 10 test scenarios → 8 integration test tasks (T031-T038)
   - Each user story → validation in quickstart execution

4. **Ordering Applied**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - TDD: All tests written before implementation
   - Dependencies clearly mapped to prevent blocking

## Validation Checklist ✅

- [x] All contracts have corresponding tests (T018-T030)
- [x] All entities have model/migration tasks (T006-T017)
- [x] All tests come before implementation (T018-T038 before T039+)
- [x] Parallel tasks are truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Constitutional principles followed (component-first, API-first, test-first)
- [x] Performance targets integrated (search optimization, caching)
- [x] Security requirements addressed (RLS, validation, authentication)
