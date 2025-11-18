# Phase 0: Research & Decisions

**Feature**: Magic Items (Read-Only Starter)
**Date**: 2025-11-17

## Clarifications Resolved

### 1. Search Scope

**Decision**: Include descriptions in search
**Rationale**: Enhances discoverability - GMs often remember item details but not exact names (e.g., searching "invisibility" finds both Ring of Invisibility and Potion of Invisibility)
**Alternatives Considered**:

- Name-only search: Too restrictive, poor UX
- Trait description search: Too complex for MVP
  **Implementation**: PostgreSQL full-text search or pg_trgm fuzzy matching on name + description fields

### 2. Default Sort Order

**Decision**: Alphabetical by name (A-Z)
**Rationale**: Matches existing monsters/spells patterns, easy to scan, predictable
**Alternatives Considered**:

- Rarity-based: Source data lacks rarity field
- Category-based: No clear categorization in data
  **Implementation**: ORDER BY name ASC in SQL queries

### 3. Filter by Trait Types

**Decision**: Defer to Phase 2 (not in MVP)
**Rationale**: User uncertain, adds complexity, simple search covers 80% of needs
**Alternatives Considered**:

- Multi-select trait filter: Requires JSONB querying, additional UI complexity
- Trait badges as filters: Good UX but deferred
  **Future**: Add after MVP validation with users

### 4. User Favorites/Bookmarks

**Decision**: Defer to Phase 2
**Rationale**: Focus on core browsing/viewing first, add favorites after validation
**Alternatives Considered**: Include in MVP - rejected to reduce scope
**Implementation**: Will reuse existing user_favorites pattern when ready

### 5. Multiple Traits of Same Type

**Decision**: Allowed in data model
**Rationale**: Starter data contains items with multiple Benefits or other trait types
**Alternatives Considered**: Single trait per type - rejected, conflicts with source data
**Implementation**: JSONB array supports 0-N traits per type

## Technical Research

### Database Schema Pattern

**Decision**: Follow official_monsters/official_spells pattern
**Findings**:

- Table: `official_magic_items`
- Columns: id (UUID), name (TEXT), slug (TEXT UNIQUE), description (TEXT), traits (JSONB)
- Indexes: slug (unique), name (GIN for search), traits (GIN for future filtering)
  **Source**: Existing migrations 20250919000001_create_official_monsters.sql, 20250919000003_create_official_spells.sql

### API Endpoint Pattern

**Decision**: RESTful routes following /api/monsters pattern
**Findings**:

- GET /api/magic-items?search=term → list with optional search
- GET /api/magic-items/[slug] → single item detail
- Response format: { data: MagicItem | MagicItem[], error?: string }
  **Source**: Existing app/api/monsters/route.ts, app/api/spells/route.ts

### Component Architecture

**Decision**: Server Components with URL-based search (follow spells pattern)
**Findings**:

- Page: app/magic-items/page.tsx (Server Component with searchParams)
- Components: components/magic-items/MagicItemCard.tsx, TraitBadge.tsx
- Detail: app/magic-items/[slug]/page.tsx (Server Component)
- No client-side search wrapper needed (server-side filtering via searchParams)
  **Source**: Existing app/spells/page.tsx pattern (server-side search)

### Search Implementation

**Decision**: Use existing fuzzy_search SQL function
**Findings**:

- Function: `fuzzy_search(search_text TEXT)` using pg_trgm
- Applied to: name and description concatenation
- Returns: similarity score for ranking
  **Source**: Migration 20250921000016_add_fuzzy_search_function.sql

### Favorites Integration

**Decision**: Extend user_favorites table with content_type
**Findings**:

- Table: `user_favorites` with columns user_id, content_id, content_type, created_at
- Add content_type = 'magic_item' enum value
- RLS policies: user can only manage own favorites
  **Source**: Existing user_favorites schema from CLAUDE.md context

### Data Seeding

**Decision**: SQL migration with JSON import
**Findings**:

- Source file: starter-data/magic-items.json (150 items)
- Migration: INSERT INTO official_magic_items SELECT \* FROM json_populate_recordset
- Traits structure: Array of {name: string, description: string}
  **Validation**: All items have name, slug, description; traits is optional array

## Technology Stack Validation

### Next.js 15 App Router

**Confirmed**: Async params in route handlers

- Pattern: `{ params }: { params: Promise<{ slug: string }> }`
- Must await: `const { slug } = await params`
  **Source**: CLAUDE.md API Route Patterns section

### Supabase Client

**Confirmed**: Server-side createClient() is async

- Pattern: `const supabase = await createClient()`
- Import: `@/lib/supabase/server`
  **Source**: CLAUDE.md Supabase Client Usage section

### Zod Validation

**Confirmed**: Use .issues not .errors

- Error handling: `if (error instanceof z.ZodError) { error.issues }`
  **Source**: CLAUDE.md Zod Validation Error Handling section

### shadcn/ui Components

**Confirmed**: Available components for magic items

- Card: For item listings
- Badge: For trait type labels
- Input: For search field
- Button: For favorites toggle
  **Source**: Constitution v1.4.0 - shadcn/ui with Radix UI primitives

## Performance Considerations

### Database Queries

**Target**: <300ms for list, <100ms for single item
**Approach**:

- Index on slug for O(1) lookup
- GIN index on name for fast search
- Limit results to 50 items per page (pagination)
  **Validation**: Test with full 150-item dataset

### Page Load

**Target**: <2s initial load
**Approach**:

- Server Component for initial render (SSR)
- Client Component only for search interactivity
- No images in MVP (icon URLs deferred)
  **Validation**: Lighthouse CI target >90 performance score

### Search Performance

**Target**: <500ms search response
**Approach**:

- Debounce search input (300ms)
- Server-side fuzzy_search function (PostgreSQL)
- Client-side result caching (React Query)
  **Validation**: Test with common search terms

## Risk Assessment

### Low Risk

- Database schema follows proven pattern ✅
- API routes mirror existing implementation ✅
- UI components reuse established patterns ✅

### Medium Risk

- Favorites integration requires enum update to user_favorites
- JSONB trait structure more complex than flat fields
- Migration must handle 150 items atomically

### Mitigation

- Test favorites with existing monsters/spells first
- Validate JSON structure in migration with CHECK constraint
- Wrap migration in transaction, verify row count

## Dependencies

### Blocked By

- None - all infrastructure exists

### Blocks

- Future user-created magic items feature
- Future encounter table magic item loot

### Enables

- GM treasure reward planning
- Campaign preparation workflows
- Content discovery for new GMs

## Next Steps (Phase 1)

1. Generate data-model.md (entity definitions)
2. Generate API contracts (OpenAPI/JSON schema)
3. Generate contract tests (failing)
4. Generate quickstart.md (E2E test scenario)
5. Update CLAUDE.md with magic items context
