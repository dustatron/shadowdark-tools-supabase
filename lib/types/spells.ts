// Spell type definitions
// Consolidates spell types from inline definitions across components

// Base spell entity (from database schema)
export interface BaseSpell {
  id: string;
  name: string;
  slug: string;
  description: string;
  classes: string[];
  duration: string;
  range: string;
  tier: number;
  source: string;
  author_notes?: string;
  icon_url?: string | null;
  art_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Official spell from official_spells table
export interface OfficialSpell extends BaseSpell {
  spell_type: "official";
}

// User-created spell from user_spells table
export interface UserSpell extends BaseSpell {
  user_id: string;
  creator_id?: string;
  is_public: boolean;
  spell_type: "user";
}

// Combined spell from all_spells view
export interface AllSpell extends BaseSpell {
  spell_type: "official" | "user";
  user_id?: string;
  creator_id?: string;
  creator_name?: string | null;
  is_public?: boolean;
}

// Spell with author details (for detail pages)
export interface SpellWithAuthor extends AllSpell {
  author?: {
    id: string;
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
}

// Filter types
export interface SpellFilterValues {
  search: string;
  tierRange: [number, number];
  tiers: number[];
  classes: string[];
  durations: string[];
  ranges: string[];
  sources: string[];
  spellSource: "all" | "official" | "custom";
}

// Pagination types
export interface SpellPaginationState {
  page: number;
  limit: number;
}

export interface SpellPaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API response types
export interface SpellSearchResponse {
  results: AllSpell[];
  total: number;
  pagination: SpellPaginationResponse;
  query: {
    q?: string;
    tiers?: number[];
    classes?: string[];
    durations?: string[];
    ranges?: string[];
    sources?: string[];
    spellTypes?: string[];
    page: number;
    limit: number;
  };
}

export interface UserSpellListResponse {
  data: UserSpell[];
  pagination: SpellPaginationResponse;
}

// Component prop types
export interface SpellCardProps {
  spell: AllSpell | OfficialSpell | UserSpell;
  showSource?: boolean;
  currentUserId?: string;
  favoriteId?: string;
}

export interface SpellFiltersProps {
  filters: SpellFilterValues;
  onFiltersChange: (filters: SpellFilterValues) => void;
  availableClasses?: string[];
  availableDurations?: string[];
  availableRanges?: string[];
  availableSources?: string[];
  loading?: boolean;
}

// Default values
export const DEFAULT_SPELL_FILTERS: SpellFilterValues = {
  search: "",
  tierRange: [1, 5],
  tiers: [],
  classes: [],
  durations: [],
  ranges: [],
  sources: [],
  spellSource: "all",
};

export const DEFAULT_SPELL_PAGINATION: SpellPaginationState = {
  page: 1,
  limit: 20,
};

// Spell class types
export const SPELL_CLASSES = ["wizard", "priest"] as const;
export type SpellClass = (typeof SPELL_CLASSES)[number];

// Spell tier range
export const SPELL_TIER_MIN = 1;
export const SPELL_TIER_MAX = 5;
