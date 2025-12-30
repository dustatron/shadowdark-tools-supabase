# Data Model: DB Function Migration

## Overview

This document describes the TypeScript service interfaces that will replace PostgreSQL RPC functions. No database schema changes required - we're wrapping existing tables/views.

---

## Service Interfaces

### MonsterSearchService

**File**: `lib/services/monster-search.ts`

```typescript
interface SearchMonstersParams {
  searchQuery?: string;
  minChallengeLevel?: number;
  maxChallengeLevel?: number;
  monsterTypes?: string[];
  locationTags?: string[];
  sourceFilter?: string;
  limit?: number;
  offset?: number;
}

interface MonsterSearchResult {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Attack[];
  abilities: Ability[];
  treasure: Treasure;
  tags: MonsterTags;
  source: string;
  author_notes: string | null;
  icon_url: string | null;
  art_url: string | null;
  xp: number;
  strength_mod: number;
  dexterity_mod: number;
  constitution_mod: number;
  intelligence_mod: number;
  wisdom_mod: number;
  charisma_mod: number;
  monster_type: "official" | "custom";
  user_id: string | null;
  is_public: boolean;
  is_official: boolean;
  created_at: string;
  updated_at: string;
  relevance: number;
}

// Functions
async function searchMonsters(
  supabase: SupabaseClient,
  params: SearchMonstersParams,
): Promise<MonsterSearchResult[]>;

async function getRandomMonsters(
  supabase: SupabaseClient,
  count: number,
  filters?: Pick<
    SearchMonstersParams,
    "minChallengeLevel" | "maxChallengeLevel" | "monsterTypes" | "locationTags"
  >,
): Promise<MonsterSearchResult[]>;
```

---

### UnifiedSearchService

**File**: `lib/services/unified-search.ts`

```typescript
interface UnifiedSearchParams {
  searchQuery: string;
  sourceFilter?: "all" | "core" | "user";
  includeMonsters?: boolean;
  includeMagicItems?: boolean;
  includeEquipment?: boolean;
  includeSpells?: boolean;
  limit?: number;
}

interface UnifiedSearchResult {
  id: string;
  name: string;
  contentType: "monster" | "magic_item" | "equipment" | "spell";
  source: "official" | "user";
  detailUrl: string;
  relevance: number;
  description: string | null;
}

// Functions
async function searchAllContent(
  supabase: SupabaseClient,
  params: UnifiedSearchParams,
): Promise<UnifiedSearchResult[]>;
```

---

### AuditService

**File**: `lib/services/audit.ts`

```typescript
interface CreateAuditLogParams {
  actionType: string;
  adminUserId: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  notes?: string;
}

// Functions
async function createAuditLog(
  supabase: SupabaseClient,
  params: CreateAuditLogParams,
): Promise<string>; // Returns audit log UUID
```

---

## Existing Types (Reference)

Located in `lib/types/`:

```typescript
// From lib/types/monster.ts or similar
interface Attack {
  name: string;
  damage: string;
  range?: string;
}

interface Ability {
  name: string;
  description: string;
}

interface Treasure {
  // treasure configuration
}

interface MonsterTags {
  type?: string[];
  location?: string[];
}
```

---

## Database Views Used

### all_monsters

- UNION of `official_monsters` + public `user_monsters`
- Adds `monster_type` discriminator

### all_spells

- UNION of `official_spells` + public `user_spells`
- Adds `spell_type` discriminator

### all_magic_items

- UNION of `official_magic_items` + public `user_magic_items`
- Adds `item_type` discriminator

### equipment

- Single table (official only, no user content)

---

## Tables Modified

### audit_logs

Existing table, no changes:

- `id` UUID
- `admin_user_id` UUID (FK to user_profiles)
- `action_type` TEXT
- `target_id` UUID
- `target_type` TEXT
- `details` JSONB
- `notes` TEXT
- `created_at` TIMESTAMPTZ

---

## Validation Rules

### Search Parameters

- `searchQuery`: max 200 chars, trimmed
- `minChallengeLevel`: 1-20, must be <= maxChallengeLevel
- `maxChallengeLevel`: 1-20, must be >= minChallengeLevel
- `limit`: 1-100, default 20
- `offset`: >= 0, default 0

### Audit Log

- `actionType`: required, non-empty
- `adminUserId`: required, valid UUID
- `targetId`: optional, valid UUID if provided
- `details`: optional, valid JSON object

---

## Migration Path

1. Create new service files alongside existing code
2. Update API routes to use services instead of RPC
3. Verify API responses unchanged
4. Remove RPC calls from codebase
5. DB functions remain for backward compatibility (can be removed later)
