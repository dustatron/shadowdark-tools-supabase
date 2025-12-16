import { createClient } from "@/lib/supabase/server";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { SpellsClient } from "./SpellsClient";

export default async function SpellsPage() {
  const supabase = await createClient();

  // Fetch user data on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's favorites, adventure list items, and deck items if authenticated
  let initialFavoritesMap = new Map<string, string>();
  let initialInListsSet = new Set<string>();
  let initialInDecksSet = new Set<string>();

  if (user) {
    // Fetch favorites
    const { data: favorites } = await supabase
      .from("favorites")
      .select("id, item_id")
      .eq("user_id", user.id)
      .eq("item_type", "spell");

    if (favorites) {
      initialFavoritesMap = createFavoritesMap(
        favorites.map((fav) => ({
          item_id: fav.item_id,
          favorite_id: fav.id,
        })),
      );
    }

    // Fetch spells that are in adventure lists
    const { data: listItems } = await supabase
      .from("adventure_list_items")
      .select("item_id, adventure_lists!inner(user_id)")
      .eq("item_type", "spell")
      .eq("adventure_lists.user_id", user.id);

    if (listItems) {
      initialInListsSet = new Set(listItems.map((item) => item.item_id));
    }

    // Fetch spells that are in decks
    const { data: deckItems } = await supabase
      .from("deck_items")
      .select("spell_id, decks!inner(user_id)")
      .eq("decks.user_id", user.id);

    if (deckItems) {
      initialInDecksSet = new Set(deckItems.map((item) => item.spell_id));
    }
  }

  return (
    <SpellsClient
      currentUserId={user?.id || null}
      initialFavoritesMap={initialFavoritesMap}
      initialInListsSet={initialInListsSet}
      initialInDecksSet={initialInDecksSet}
    />
  );
}
