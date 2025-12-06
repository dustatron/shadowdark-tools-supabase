# Research: User-Generated Magic Items

**Feature**: 012-for-magic-items
**Date**: 2025-12-05

## Existing Patterns

### User-Generated Content Pattern

The project has established patterns for user content:

- `user_monsters` table: user_id, is_public, source field
- `user_spells` table: user_id, creator_id, is_public, source field
- Both use RLS with policies for owner + public + admin access

### Official Content Pattern

- `official_monsters`, `official_spells`, `official_magic_items` tables
- Public read-only access
- No user_id, always public

### Combined Views Pattern

- `all_monsters` view: UNION of official + public user_monsters
- `all_spells` view: UNION of official + public user_spells
- Adds `monster_type`/`spell_type` to distinguish source

### User Profiles

- `user_profiles` table with `display_name` for attribution
- Foreign key from user content to `user_profiles(id)`
- Auto-created on auth.users insert

## Decisions

### Decision 1: Duplicate Names

**Decision**: Allow duplicate names across users
**Rationale**: Same as monsters/spells - each user's namespace is independent. Official items may share names with user items.
**Alternatives**: Require unique names (rejected - too restrictive for homebrew)

### Decision 2: Default Visibility

**Decision**: Default to private (is_public = false)
**Rationale**: Constitution VII states "User-generated content defaults to private with explicit opt-in for public sharing"
**Alternatives**: Default public (rejected - violates constitution)

### Decision 3: Account Deletion

**Decision**: Cascade delete (user content deleted with account)
**Rationale**: Matches existing user_monsters/user_spells pattern (ON DELETE CASCADE)
**Alternatives**: Anonymize (rejected - complicates data model, user may not want content preserved)

### Decision 4: Visibility Toggle

**Decision**: Allow freely changing public↔private
**Rationale**: Matches existing patterns. No dependencies on public items.
**Alternatives**: Restrict changes (rejected - over-complicated for MVP)

## Technical Approach

### Database Schema

Create `user_magic_items` table following `user_monsters` pattern:

- user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE
- is_public BOOLEAN NOT NULL DEFAULT false
- Reuse traits JSONB structure from official_magic_items

### View for Combined Access

Create `all_magic_items` view following `all_monsters` pattern:

- UNION official_magic_items + public user_magic_items
- Add `item_type` ('official' vs 'custom')
- Add `user_id` (NULL for official)
- Include creator display_name via join for user items

### Source Attribution Display

- Official items: Show "Core Rules" badge
- User items: Show creator's display_name with link to profile
- Card and detail page both show source

### API Endpoints

Following existing patterns:

- GET /api/user/magic-items - List user's own items
- POST /api/user/magic-items - Create new item
- GET /api/user/magic-items/[id] - Get single item
- PUT /api/user/magic-items/[id] - Update item
- DELETE /api/user/magic-items/[id] - Delete item
- Update /api/search/magic-items to include user items

## Open Questions Resolved

| Question            | Resolution                        |
| ------------------- | --------------------------------- |
| Duplicate names?    | Allow - follows existing patterns |
| Default visibility? | Private - per constitution        |
| Account deletion?   | Cascade delete - follows existing |
| Visibility toggle?  | Allow freely - follows existing   |
