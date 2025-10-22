export interface Profile {
  id: string;
  username: string;
  username_slug: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  monstersCount: number;
  spellsCount: number;
  encounterTablesCount: number;
  favoriteMonstersCount: number;
  favoriteSpellsCount: number;
}

export interface ProfileWithStats extends Profile {
  stats: ProfileStats;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_type: "monster" | "spell";
  item_id: string;
  created_at: string;
}

export type DashboardTab =
  | "monsters"
  | "spells"
  | "encounters"
  | "favorite-monsters"
  | "favorite-spells";
