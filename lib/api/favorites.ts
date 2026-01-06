import { createClient } from "@/lib/supabase/server";
import { Favorite } from "@/lib/types/profile.types";

export async function addToFavorites(
  userId: string,
  itemType: "monster" | "spell" | "magic_item",
  itemId: string,
): Promise<Favorite> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, item_type: itemType, item_id: itemId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromFavorites(favoriteId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId);

  if (error) throw error;
}

export async function getFavoriteId(
  userId: string,
  itemType: "monster" | "spell" | "magic_item",
  itemId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .single();

  return data?.id || null;
}

export async function getUserFavoriteIds(
  userId: string,
  itemType: "monster" | "spell" | "magic_item",
): Promise<Array<{ item_id: string; favorite_id: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("id, item_id")
    .eq("user_id", userId)
    .eq("item_type", itemType);

  if (error) return [];

  return data.map((fav) => ({
    item_id: fav.item_id,
    favorite_id: fav.id,
  }));
}
