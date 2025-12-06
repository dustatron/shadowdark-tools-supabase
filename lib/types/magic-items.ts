import type { Trait, TraitType } from "@/lib/schemas/magic-items";

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
export type OfficialMagicItem = BaseMagicItem;

// User-created magic item from user_magic_items table
export interface UserMagicItem extends BaseMagicItem {
  user_id: string;
  is_public: boolean;
}

// Combined magic item from all_magic_items view
export interface AllMagicItem extends BaseMagicItem {
  item_type: "official" | "custom";
  user_id: string | null;
  creator_name: string | null;
  is_public: boolean;
}

// API response types
export interface UserMagicItemListResponse {
  data: UserMagicItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MagicItemSearchResponse {
  results: AllMagicItem[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  query: {
    q?: string;
    traitTypes?: string[];
    source?: "official" | "community" | "all";
    favorites?: boolean;
    page: number;
    limit: number;
  };
}

// Props for components
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

// Re-export trait types for convenience
export type { Trait, TraitType };
