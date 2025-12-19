import { SupabaseClient } from "@supabase/supabase-js";
import {
  AdventureListItem,
  MonsterDetails,
  SpellDetails,
  MagicItemDetails,
  EquipmentDetails,
  EncounterTableDetails,
} from "@/lib/types/adventure-lists";

type ItemType =
  | "monster"
  | "spell"
  | "magic_item"
  | "equipment"
  | "encounter_table";

interface BaseListItem {
  id: string;
  list_id: string;
  item_type: ItemType;
  item_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Type-specific item types for each fetch function
type MonsterItem = AdventureListItem & {
  item_type: "monster";
  details: MonsterDetails;
};
type SpellItem = AdventureListItem & {
  item_type: "spell";
  details: SpellDetails;
};
type MagicItemItem = AdventureListItem & {
  item_type: "magic_item";
  details: MagicItemDetails;
};
type EquipmentItem = AdventureListItem & {
  item_type: "equipment";
  details: EquipmentDetails;
};
type EncounterTableItem = AdventureListItem & {
  item_type: "encounter_table";
  details: EncounterTableDetails;
};

/**
 * Fetch and enrich adventure list items with their details from respective tables.
 * Replaces the DB function `get_adventure_list_items` with TypeScript implementation.
 *
 * @param supabase - Supabase client instance
 * @param listId - UUID of the adventure list
 * @returns Array of enriched adventure list items
 */
export async function getAdventureListItems(
  supabase: SupabaseClient,
  listId: string,
): Promise<AdventureListItem[]> {
  // Fetch base items from adventure_list_items
  const { data: baseItems, error: baseError } = await supabase
    .from("adventure_list_items")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", { ascending: true });

  if (baseError) {
    throw new Error(`Failed to fetch list items: ${baseError.message}`);
  }

  if (!baseItems || baseItems.length === 0) {
    return [];
  }

  // Group items by type for efficient batching
  const itemsByType = baseItems.reduce(
    (acc, item) => {
      const typed = item as BaseListItem;
      if (!acc[typed.item_type]) {
        acc[typed.item_type] = [];
      }
      acc[typed.item_type].push(typed);
      return acc;
    },
    {} as Record<ItemType, BaseListItem[]>,
  );

  // Parallel fetch details for each item type
  const [monsters, spells, magicItems, equipment, encounterTables] =
    await Promise.all([
      fetchMonsterDetails(supabase, itemsByType.monster || []),
      fetchSpellDetails(supabase, itemsByType.spell || []),
      fetchMagicItemDetails(supabase, itemsByType.magic_item || []),
      fetchEquipmentDetails(supabase, itemsByType.equipment || []),
      fetchEncounterTableDetails(supabase, itemsByType.encounter_table || []),
    ]);

  // Combine all enriched items
  return [
    ...monsters,
    ...spells,
    ...magicItems,
    ...equipment,
    ...encounterTables,
  ];
}

/**
 * Fetch monster details from official_monsters and user_monsters tables
 */
async function fetchMonsterDetails(
  supabase: SupabaseClient,
  items: BaseListItem[],
): Promise<MonsterItem[]> {
  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.item_id);

  // Fetch from both official and user monsters
  const [{ data: officialMonsters }, { data: userMonsters }] =
    await Promise.all([
      supabase
        .from("official_monsters")
        .select(
          "id, name, challenge_level, hit_points, armor_class, source, tags, speed",
        )
        .in("id", itemIds),
      supabase
        .from("user_monsters")
        .select(
          "id, name, challenge_level, hit_points, armor_class, source, tags, speed",
        )
        .in("id", itemIds),
    ]);

  // Create lookup map
  const monsterMap = new Map<string, any>();
  officialMonsters?.forEach((m) => monsterMap.set(m.id, m));
  userMonsters?.forEach((m) => monsterMap.set(m.id, m));

  // Merge with base items
  return items.map((item): MonsterItem => {
    const monster = monsterMap.get(item.item_id);
    return {
      id: item.id,
      list_id: item.list_id,
      item_type: "monster" as const,
      item_id: item.item_id,
      quantity: item.quantity,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: monster?.name || "Unknown Monster",
      description: "",
      slug: undefined,
      details: {
        challenge_level: monster?.challenge_level,
        hit_points: monster?.hit_points,
        armor_class: monster?.armor_class,
        source: monster?.source,
        tags: monster?.tags,
        speed: monster?.speed,
      },
    };
  });
}

/**
 * Fetch spell details from official_spells and user_spells tables
 */
async function fetchSpellDetails(
  supabase: SupabaseClient,
  items: BaseListItem[],
): Promise<SpellItem[]> {
  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.item_id);

  const [{ data: officialSpells }, { data: userSpells }] = await Promise.all([
    supabase
      .from("official_spells")
      .select(
        "id, name, slug, description, tier, classes, duration, range, source",
      )
      .in("id", itemIds),
    supabase
      .from("user_spells")
      .select(
        "id, name, slug, description, tier, classes, duration, range, source",
      )
      .in("id", itemIds),
  ]);

  const spellMap = new Map<string, any>();
  officialSpells?.forEach((s) => spellMap.set(s.id, s));
  userSpells?.forEach((s) => spellMap.set(s.id, s));

  return items.map((item): SpellItem => {
    const spell = spellMap.get(item.item_id);
    return {
      id: item.id,
      list_id: item.list_id,
      item_type: "spell" as const,
      item_id: item.item_id,
      quantity: item.quantity,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: spell?.name || "Unknown Spell",
      description: spell?.description || "",
      slug: spell?.slug,
      details: {
        tier: spell?.tier,
        classes: spell?.classes,
        duration: spell?.duration,
        range: spell?.range,
        source: spell?.source,
      },
    };
  });
}

/**
 * Fetch magic item details from official_magic_items and user_magic_items tables
 */
async function fetchMagicItemDetails(
  supabase: SupabaseClient,
  items: BaseListItem[],
): Promise<MagicItemItem[]> {
  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.item_id);

  const [{ data: officialItems }, { data: userItems }] = await Promise.all([
    supabase
      .from("official_magic_items")
      .select("id, name, slug, description, traits")
      .in("id", itemIds),
    supabase
      .from("user_magic_items")
      .select("id, name, slug, description, traits")
      .in("id", itemIds),
  ]);

  const itemMap = new Map<string, any>();
  officialItems?.forEach((i) => itemMap.set(i.id, i));
  userItems?.forEach((i) => itemMap.set(i.id, i));

  return items.map((item): MagicItemItem => {
    const magicItem = itemMap.get(item.item_id);
    return {
      id: item.id,
      list_id: item.list_id,
      item_type: "magic_item" as const,
      item_id: item.item_id,
      quantity: item.quantity,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: magicItem?.name || "Unknown Magic Item",
      description: magicItem?.description || "",
      slug: magicItem?.slug,
      details: {
        traits: magicItem?.traits,
      },
    };
  });
}

/**
 * Fetch equipment details from equipment table
 */
async function fetchEquipmentDetails(
  supabase: SupabaseClient,
  items: BaseListItem[],
): Promise<EquipmentItem[]> {
  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.item_id);

  const { data: equipmentList } = await supabase
    .from("equipment")
    .select(
      "id, name, item_type, cost, attack_type, range, damage, armor, properties, slot, quantity",
    )
    .in("id", itemIds);

  const equipmentMap = new Map<string, any>();
  equipmentList?.forEach((e) => equipmentMap.set(e.id, e));

  return items.map((item): EquipmentItem => {
    const equipment = equipmentMap.get(item.item_id);
    return {
      id: item.id,
      list_id: item.list_id,
      item_type: "equipment" as const,
      item_id: item.item_id,
      quantity: item.quantity,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: equipment?.name || "Unknown Equipment",
      description: "",
      slug: undefined,
      details: {
        item_type: equipment?.item_type,
        cost: equipment?.cost,
        attack_type: equipment?.attack_type,
        range: equipment?.range,
        damage: equipment?.damage,
        armor: equipment?.armor,
        properties: equipment?.properties,
        slot: equipment?.slot,
        quantity: equipment?.quantity,
      },
    };
  });
}

/**
 * Fetch encounter table details from encounter_tables table
 */
async function fetchEncounterTableDetails(
  supabase: SupabaseClient,
  items: BaseListItem[],
): Promise<EncounterTableItem[]> {
  if (items.length === 0) return [];

  const itemIds = items.map((i) => i.item_id);

  const { data: tables } = await supabase
    .from("encounter_tables")
    .select("id, name, description, die_size, is_public, filters, public_slug")
    .in("id", itemIds);

  const tableMap = new Map<string, any>();
  tables?.forEach((t) => tableMap.set(t.id, t));

  return items.map((item): EncounterTableItem => {
    const table = tableMap.get(item.item_id);
    return {
      id: item.id,
      list_id: item.list_id,
      item_type: "encounter_table" as const,
      item_id: item.item_id,
      quantity: item.quantity,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      name: table?.name || "Unknown Encounter Table",
      description: table?.description || "",
      slug: undefined,
      details: {
        die_size: table?.die_size,
        is_public: table?.is_public,
        filters: table?.filters,
        public_slug: table?.public_slug,
      },
    };
  });
}
