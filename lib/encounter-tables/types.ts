/**
 * Type definitions for Random Encounter Tables feature
 * Based on data-model.md specifications
 */

// ============================================
// Enums and Union Types
// ============================================

export type MonsterSource = "official" | "user" | "public" | "favorites";
export type Alignment = "Lawful" | "Neutral" | "Chaotic";
export type MovementType = "fly" | "swim" | "burrow" | "climb";

// ============================================
// Filter Types
// ============================================

export interface EncounterTableFilters {
  sources: MonsterSource[]; // At least 1 required
  level_min: number; // 1-20, default 1
  level_max: number; // 1-20, default 20, must be >= level_min
  movement_types?: MovementType[]; // Optional filter
  search_query?: string; // Max 100 characters, optional
}

// ============================================
// Monster Snapshot Types
// ============================================

export interface Attack {
  name: string;
  bonus: number; // Attack roll bonus
  damage: string; // e.g., "1d8+2"
  damage_type: string; // e.g., "slashing", "piercing"
  range: string | null; // e.g., "melee", "30 ft."
  description: string | null;
}

export interface Ability {
  name: string;
  description: string;
  usage: string | null; // e.g., "1/day", "Recharge 5-6"
}

export interface Treasure {
  copper: number;
  silver: number;
  gold: number;
  items: string[]; // e.g., ["Potion of Healing", "Silver Ring"]
}

export interface MonsterSnapshot {
  // Core identification
  id: string; // Original monster UUID
  name: string;
  source: "official" | "user";

  // Core stats (Shadowdark format)
  challenge_level: number; // 1-20
  armor_class: number; // Typically 10-20
  hit_points: number;
  hit_dice: string; // e.g., "4d8"
  speed: string; // e.g., "30 ft."
  movement_types: string[];

  // Ability scores
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  // Modifiers (derived from ability scores)
  str_mod: number;
  dex_mod: number;
  con_mod: number;
  int_mod: number;
  wis_mod: number;
  cha_mod: number;

  // Combat
  attacks: Attack[];
  abilities: Ability[];
  traits: string | null;

  // Metadata
  alignment: Alignment | null;
  size: string | null; // e.g., "Medium", "Large"
  type: string | null; // e.g., "Undead", "Beast"
  description: string | null;
  lore: string | null;
  treasure: Treasure | null;

  // User-generated content fields (null for official monsters)
  user_id: string | null;
  is_public: boolean;
  icon_url: string | null;

  // Timestamps (for reference)
  created_at: Date;
  updated_at: Date;
}

// ============================================
// Database Row Types
// ============================================

export interface EncounterTableEntry {
  id: string; // UUID
  table_id: string; // UUID, foreign key to encounter_tables
  roll_number: number; // 1 to table.die_size
  monster_id: string | null; // UUID, soft reference
  monster_snapshot: MonsterSnapshot; // JSONB
  created_at: Date;
  updated_at: Date;
}

export interface EncounterTable {
  id: string; // UUID
  user_id: string; // UUID
  name: string; // 3-100 characters
  description: string | null; // Max 500 characters
  die_size: number; // 2-1000
  is_public: boolean;
  public_slug: string | null; // 8 characters
  filters: EncounterTableFilters; // JSONB
  created_at: Date;
  updated_at: Date;
  entries?: EncounterTableEntry[]; // Optional joined data
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateEncounterTableRequest {
  name: string;
  description?: string;
  die_size: number;
  filters: EncounterTableFilters;
  generate_immediately?: boolean; // Default true
}

export interface UpdateEncounterTableRequest {
  name?: string;
  description?: string;
  filters?: EncounterTableFilters;
}

export interface ReplaceEntryRequest {
  mode: "random" | "search";
  monster_id?: string; // Required when mode=search
}

export interface ShareTableRequest {
  is_public: boolean;
}

export interface RollResult {
  roll_number: number;
  entry: EncounterTableEntry;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page?: number; // Default 1
  limit?: number; // Default 20, max 100
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ============================================
// Utility Types
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface UserFriendlyError {
  message: string;
  details?: string[];
  statusCode?: number;
}
