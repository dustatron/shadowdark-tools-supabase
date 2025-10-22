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
    .from("user_encounter_tables")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getFavoriteMonsters(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(
      `
      *,
      monster:all_monsters(*)
    `,
    )
    .eq("user_id", userId)
    .eq("item_type", "monster")
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getFavoriteSpells(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(
      `
      *,
      spell:all_spells(*)
    `,
    )
    .eq("user_id", userId)
    .eq("item_type", "spell")
    .order("created_at", { ascending: false });

  return data || [];
}
