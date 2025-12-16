import { createClient } from "@/lib/supabase/server";
import { createFavoritesMap } from "@/lib/utils/favorites";
import { MonstersClient } from "./MonstersClient";
import {
  parseFiltersFromSearchParams,
  parsePaginationFromSearchParams,
} from "@/lib/types/monsters";

interface MonstersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MonstersPage({
  searchParams,
}: MonstersPageProps) {
  const supabase = await createClient();

  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Parse filters and pagination from URL
  const initialFilters = parseFiltersFromSearchParams(params);
  const initialPagination = parsePaginationFromSearchParams(params);

  // Fetch user data on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's favorite monsters and adventure list items if authenticated
  let initialFavoritesMap = new Map<string, string>();
  let initialInListsSet = new Set<string>();

  if (user) {
    // Fetch favorites
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

    // Fetch monsters that are in adventure lists
    const { data: listItems } = await supabase
      .from("adventure_list_items")
      .select("item_id, adventure_lists!inner(user_id)")
      .eq("item_type", "monster")
      .eq("adventure_lists.user_id", user.id);

    if (listItems) {
      initialInListsSet = new Set(listItems.map((item) => item.item_id));
    }
  }

  return (
    <MonstersClient
      currentUserId={user?.id || null}
      initialFavoritesMap={initialFavoritesMap}
      initialInListsSet={initialInListsSet}
      initialFilters={initialFilters}
      initialPagination={initialPagination}
    />
  );
}
