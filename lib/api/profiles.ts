import { createClient } from "@/lib/supabase/server";
import {
  Profile,
  ProfileStats,
  ProfileWithStats,
} from "@/lib/types/profile.types";

// Get profile by username slug
export async function getProfileBySlug(
  slug: string,
): Promise<ProfileWithStats | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("username_slug", slug)
    .single();

  if (error || !profile) return null;

  const stats = await getProfileStats(profile.id);
  return { ...profile, stats };
}

// Get profile stats
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = await createClient();

  const [monsters, spells, encounters, favMonsters, favSpells] =
    await Promise.all([
      supabase
        .from("user_monsters")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_public", true),

      supabase
        .from("user_spells")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_public", true),

      supabase
        .from("user_encounter_tables")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("is_public", true),

      supabase
        .from("favorites")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("item_type", "monster"),

      supabase
        .from("favorites")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("item_type", "spell"),
    ]);

  return {
    monstersCount: monsters.count || 0,
    spellsCount: spells.count || 0,
    encounterTablesCount: encounters.count || 0,
    favoriteMonstersCount: favMonsters.count || 0,
    favoriteSpellsCount: favSpells.count || 0,
  };
}

// Check username availability
export async function isUsernameAvailable(
  username: string,
  currentUserId?: string,
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from("user_profiles")
    .select("id")
    .eq("username", username);

  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data } = await query.single();
  return !data;
}
