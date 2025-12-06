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
    total: number;
  };
}

export interface AdventureListItem {
  id: string;
  list_id: string;
  item_type: "monster" | "spell" | "magic_item";
  item_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined data from the referenced item
  name: string;
  description: string;
  slug?: string;
  details: any; // Varies based on item_type
}

export interface AdventureListWithItems {
  list: AdventureList;
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
  };
}
