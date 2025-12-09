import type { Trait, TraitType } from "@/lib/schemas/magic-items";

// Re-export trait types for convenience
export type { Trait, TraitType };

// Base magic item fields shared by official and user items
export interface BaseMagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: Trait[];
  created_at: string;
  updated_at: string;
}

// Official magic item from official_magic_items table
export interface OfficialMagicItem extends BaseMagicItem {
  item_type: "official";
}

// User-created magic item from user_magic_items table
export interface UserMagicItem extends BaseMagicItem {
  user_id: string;
  is_public: boolean;
  item_type: "custom";
}

// Combined magic item from all_magic_items view
export interface AllMagicItem extends BaseMagicItem {
  item_type: "official" | "custom";
  user_id: string | null;
  creator_name: string | null;
  is_public: boolean;
}

// Magic item with author details (for detail pages)
export interface MagicItemWithAuthor extends AllMagicItem {
  author?: {
    id: string;
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
}

// Filter types
export interface MagicItemFilterValues {
  search: string;
  traitTypes: string[];
  source: "official" | "community" | "all";
  favorites?: boolean;
}

// Pagination types
export interface MagicItemPaginationState {
  page: number;
  limit: number;
}

export interface MagicItemPaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API response types
export interface UserMagicItemListResponse {
  data: UserMagicItem[];
  pagination: MagicItemPaginationResponse;
}

export interface MagicItemSearchResponse {
  results: AllMagicItem[];
  total: number;
  pagination: MagicItemPaginationResponse;
  query: {
    q?: string;
    traitTypes?: string[];
    source?: "official" | "community" | "all";
    favorites?: boolean;
    page: number;
    limit: number;
  };
}

// Component prop types
export interface MagicItemCardProps {
  item: AllMagicItem | OfficialMagicItem;
  showSource?: boolean;
  currentUserId?: string;
  favoriteId?: string;
}

export interface SourceBadgeProps {
  itemType: "official" | "custom";
  creatorName?: string | null;
  userId?: string | null;
}

export interface MagicItemFiltersProps {
  filters: MagicItemFilterValues;
  onFiltersChange: (filters: MagicItemFilterValues) => void;
  availableTraitTypes?: string[];
  loading?: boolean;
}

// Default values
export const DEFAULT_MAGIC_ITEM_FILTERS: MagicItemFilterValues = {
  search: "",
  traitTypes: [],
  source: "all",
  favorites: false,
};

export const DEFAULT_MAGIC_ITEM_PAGINATION: MagicItemPaginationState = {
  page: 1,
  limit: 20,
};
