import { createClient } from "@/lib/supabase/server";

export async function getUserMonsters(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_monsters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getUserSpells(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_spells")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getUserEncounterTables(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("encounter_tables")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getFavoriteMonsters(userId: string) {
  const supabase = await createClient();

  // First get the favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", "monster")
    .order("created_at", { ascending: false });

  if (!favorites || favorites.length === 0) {
    return [];
  }

  // Get all monster IDs
  const monsterIds = favorites.map((f) => f.item_id);

  // Fetch the monsters
  const { data: monsters } = await supabase
    .from("all_monsters")
    .select("*")
    .in("id", monsterIds);

  // Combine the data
  const monstersMap = new Map(monsters?.map((m) => [m.id, m]) || []);

  return favorites.map((fav) => ({
    ...fav,
    monster: monstersMap.get(fav.item_id) || null,
  }));
}

export async function getFavoriteSpells(userId: string) {
  const supabase = await createClient();

  // First get the favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", "spell")
    .order("created_at", { ascending: false });

  if (!favorites || favorites.length === 0) {
    return [];
  }

  // Get all spell IDs
  const spellIds = favorites.map((f) => f.item_id);

  // Fetch the spells
  const { data: spells } = await supabase
    .from("all_spells")
    .select("*")
    .in("id", spellIds);

  // Combine the data
  const spellsMap = new Map(spells?.map((s) => [s.id, s]) || []);

  return favorites.map((fav) => ({
    ...fav,
    spell: spellsMap.get(fav.item_id) || null,
  }));
}

export async function getFavoriteMagicItems(userId: string) {
  const supabase = await createClient();

  // First get the favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", "magic_item")
    .order("created_at", { ascending: false });

  if (!favorites || favorites.length === 0) {
    return [];
  }

  // Get all magic item IDs
  const magicItemIds = favorites.map((f) => f.item_id);

  // Fetch the magic items
  const { data: magicItems } = await supabase
    .from("all_magic_items")
    .select("*")
    .in("id", magicItemIds);

  // Combine the data
  const magicItemsMap = new Map(magicItems?.map((m) => [m.id, m]) || []);

  return favorites.map((fav) => ({
    ...fav,
    magic_item: magicItemsMap.get(fav.item_id) || null,
  }));
}
