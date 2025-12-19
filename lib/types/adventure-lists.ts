export interface AdventureList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  notes: string | null;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_counts?: {
    monsters: number;
    spells: number;
    magic_items: number;
    equipment: number;
    total: number;
  };
}

// Details types for each item type
export interface MonsterDetails {
  challenge_level?: number;
  hit_points?: number;
  armor_class?: number;
  source?: string;
  tags?: { type?: string[]; location?: string[] };
  speed?: string;
}

export interface SpellDetails {
  tier?: number;
  classes?: string[];
  duration?: string;
  range?: string;
  source?: string;
}

export interface MagicItemDetails {
  traits?: string[];
}

export interface EquipmentDetails {
  item_type?: string;
  cost?: { amount: number; currency: string };
  attack_type?: string;
  range?: string;
  damage?: string;
  armor?: number;
  properties?: string[];
  slot?: string;
  quantity?: number;
}

export interface EncounterTableDetails {
  die_size?: number;
  is_public?: boolean;
  filters?: Record<string, unknown>;
  public_slug?: string;
}

// Base interface for shared fields
interface BaseAdventureListItem {
  id: string;
  list_id: string;
  item_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  slug?: string;
}

// Discriminated union for type-safe item access
export type AdventureListItem =
  | (BaseAdventureListItem & { item_type: "monster"; details: MonsterDetails })
  | (BaseAdventureListItem & { item_type: "spell"; details: SpellDetails })
  | (BaseAdventureListItem & {
      item_type: "magic_item";
      details: MagicItemDetails;
    })
  | (BaseAdventureListItem & {
      item_type: "equipment";
      details: EquipmentDetails;
    })
  | (BaseAdventureListItem & {
      item_type: "encounter_table";
      details: EncounterTableDetails;
    });

// Extract specific item types from the discriminated union
export type MonsterListItem = Extract<
  AdventureListItem,
  { item_type: "monster" }
>;
export type SpellListItem = Extract<AdventureListItem, { item_type: "spell" }>;
export type MagicItemListItem = Extract<
  AdventureListItem,
  { item_type: "magic_item" }
>;
export type EquipmentListItem = Extract<
  AdventureListItem,
  { item_type: "equipment" }
>;
export type EncounterTableListItem = Extract<
  AdventureListItem,
  { item_type: "encounter_table" }
>;

// Grouped items interface for components and export functions
export interface GroupedAdventureListItems {
  monsters: MonsterListItem[];
  spells: SpellListItem[];
  magic_items: MagicItemListItem[];
  equipment: EquipmentListItem[];
  encounter_tables?: EncounterTableListItem[];
}

export interface AdventureListWithItems {
  list: AdventureList;
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
    equipment: AdventureListItem[];
    encounter_tables: AdventureListItem[];
  };
}
