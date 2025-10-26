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
      initialFilters={initialFilters}
      initialPagination={initialPagination}
    />
  );
}
