import { createClient } from "@/lib/supabase/server";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { MonstersClient } from "./MonstersClient";

export default async function MonstersPage() {
  const supabase = await createClient();

  // Fetch user data on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's favorite monsters if authenticated
  let initialFavoritesMap = new Map<string, string>();
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("id, item_id")
      .eq("user_id", user.id)
      .eq("item_type", "monster");

    if (favorites) {
      initialFavoritesMap = createFavoritesMap(
        favorites.map((fav) => ({
          item_id: fav.item_id,
          favorite_id: fav.id,
        })),
      );
    }
  }

  return (
    <MonstersClient
      currentUserId={user?.id || null}
      initialFavoritesMap={initialFavoritesMap}
    />
  );
}
