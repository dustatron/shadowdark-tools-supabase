// Database entity types for Shadowdark Monster Manager
// These types match the database schema defined in the data model

export interface DatabaseUser {
  id: string; // UUID from auth.users
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMonster {
  id: string; // UUID
  name: string;
  challenge_level: number; // 1-20
  hit_points: number; // 1+
  armor_class: number; // 1-21
  speed: string;
  attacks: MonsterAttack[];
  abilities: MonsterAbility[];
  treasure?: MonsterTreasure;
  tags: MonsterTags;
  source: string;
  author_notes?: string;
  icon_url?: string;
  art_url?: string;
  is_official: boolean;
  is_public: boolean;
  user_id?: string; // UUID, null for official monsters
  created_at: string;
  updated_at: string;
}

export interface DatabaseGroup {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  description?: string;
  monsters: GroupMonster[];
  combined_stats: GroupStats;
  tags: MonsterTags;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseList {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  description?: string;
  party_level?: number;
  challenge_level_min?: number;
  challenge_level_max?: number;
  xp_budget?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseListItem {
  id: string; // UUID
  list_id: string; // UUID
  item_type: 'monster' | 'group';
  item_id: string; // UUID
  quantity: number;
  created_at: string;
}

export interface DatabaseEncounterTable {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  die_size: number; // 2-100
  tags?: MonsterTags;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEncounterSlot {
  id: string; // UUID
  table_id: string; // UUID
  slot_number: number; // 1 to die_size
  item_type: 'monster' | 'group';
  item_id: string; // UUID
  created_at: string;
}

export interface DatabaseTagType {
  id: string; // UUID
  name: string;
  created_at: string;
}

export interface DatabaseTagLocation {
  id: string; // UUID
  name: string;
  created_at: string;
}

export interface DatabaseFavorite {
  user_id: string; // UUID
  item_type: 'monster' | 'group';
  item_id: string; // UUID
  created_at: string;
}

export interface DatabaseFlag {
  id: string; // UUID
  flagged_item_type: 'monster' | 'group';
  flagged_item_id: string; // UUID
  reporter_user_id: string; // UUID
  reason: 'inappropriate' | 'copyright' | 'spam' | 'inaccurate' | 'other';
  comment: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_at?: string;
  resolved_by?: string; // UUID
  created_at: string;
}

export interface DatabaseAuditLog {
  id: string; // UUID
  admin_user_id: string; // UUID
  action_type: string;
  target_id?: string; // UUID
  notes?: string;
  timestamp: string;
}

// JSONB Structure Types

export interface MonsterAttack {
  name: string;
  type: 'melee' | 'ranged' | 'spell';
  damage: string;
  range?: string;
  description?: string;
}

export interface MonsterAbility {
  name: string;
  description: string;
}

export interface MonsterTreasure {
  type?: 'coins' | 'items' | 'mixed' | 'none';
  amount?: string;
  items?: string[];
}

export interface MonsterTags {
  type?: string[];
  location?: string[];
}

export interface GroupMonster {
  monster_id: string; // UUID
  quantity: number;
}

export interface GroupStats {
  total_xp: number;
  total_hp: number;
  effective_cl: number;
  monster_count: number;
  average_ac: number;
}

// API Response Types

export interface MonstersSearchResponse {
  monsters: DatabaseMonster[];
  total: number;
  has_more: boolean;
}

export interface ListsResponse {
  lists: DatabaseList[];
  total: number;
  has_more: boolean;
}

export interface ListWithItems extends DatabaseList {
  items: ListItemWithDetails[];
}

export interface ListItemWithDetails extends DatabaseListItem {
  monster?: DatabaseMonster;
  group?: DatabaseGroup;
}

// Database View Types

export interface AllMonstersView extends DatabaseMonster {
  type: 'official' | 'custom';
}

// Search and Filter Types

export interface MonsterSearchFilters {
  q?: string;
  fuzziness?: 'low' | 'medium' | 'high';
  min_cl?: number;
  max_cl?: number;
  tags?: string[];
  type?: 'official' | 'custom' | 'public';
  limit?: number;
  offset?: number;
}

export interface RandomMonsterFilters {
  challenge_level_min?: number;
  challenge_level_max?: number;
  tags?: string[];
  type?: 'official' | 'custom' | 'public';
}

// Auth and Session Types

export interface UserSession {
  user: DatabaseUser;
  is_authenticated: boolean;
  is_admin: boolean;
}

export interface GuestSession {
  lists_created: number;
  encounters_generated: number;
  random_monsters_rolled: number;
  session_start: string;
}

// API Error Types

export interface APIError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError extends APIError {
  field_errors: Record<string, string[]>;
}

// Utility Types

export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface SortParams {
  sort_by: string;
  sort_direction: SortDirection;
}

export interface SearchParams extends PaginationParams, SortParams {
  q?: string;
}

// Database Connection Types

export interface DatabaseConfig {
  url: string;
  max_connections: number;
  ssl: boolean;
}

// Supabase Types

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
};

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SupabaseUser;
}

// Row Level Security Policy Types

export type RLSPolicy = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export interface RLSContext {
  user_id?: string;
  is_admin: boolean;
  is_authenticated: boolean;
}

// Export utility type helpers

export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;
export type WithoutId<T> = Omit<T, 'id'>;
export type CreateInput<T> = WithoutTimestamps<WithoutId<T>>;
export type UpdateInput<T> = Partial<WithoutTimestamps<WithoutId<T>>>;

// Database table names (for type safety)

export const TABLE_NAMES = {
  USERS: 'user_profiles',
  OFFICIAL_MONSTERS: 'official_monsters',
  USER_MONSTERS: 'user_monsters',
  USER_GROUPS: 'user_groups',
  USER_LISTS: 'user_lists',
  LIST_ITEMS: 'list_items',
  ENCOUNTER_TABLES: 'encounter_tables',
  ENCOUNTER_SLOTS: 'encounter_slots',
  TAG_TYPES: 'tag_types',
  TAG_LOCATIONS: 'tag_locations',
  USER_FAVORITES: 'user_favorites',
  FLAGS: 'flags',
  AUDIT_LOGS: 'audit_logs'
} as const;

export type TableName = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];
