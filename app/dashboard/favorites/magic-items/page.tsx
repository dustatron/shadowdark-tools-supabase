import { createClient } from "@/lib/supabase/server";
import { getFavoriteMagicItems } from "@/lib/api/dashboard";
import { MagicItemCard } from "@/components/magic-items/MagicItemCard";
import { MagicItemTable } from "@/components/magic-items/MagicItemTable";
import { ViewModeToggleLink } from "@/components/shared/ViewModeToggleLink";
import { Button } from "@/components/primitives/button";
import { Library } from "lucide-react";
import Link from "next/link";
import type { ViewMode } from "@/lib/types/monsters";
import type { AllMagicItem } from "@/lib/types/magic-items";

interface FavoriteMagicItemsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FavoriteMagicItemsPage({
  searchParams,
}: FavoriteMagicItemsPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favMagicItems = await getFavoriteMagicItems(user.id);

  // Get view mode from URL params (default to table)
  const view: ViewMode = params.view === "cards" ? "cards" : "table";

  // Extract magic items and build favorites map
  const magicItems = favMagicItems
    .filter((fav) => fav.magic_item !== null)
    .map((fav) => fav.magic_item as AllMagicItem);

  const favoritesMap = new Map(
    favMagicItems
      .filter((fav) => fav.magic_item !== null)
      .map((fav) => [fav.item_id, fav.id]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/magic-items">
            <Library className="mr-2 h-4 w-4" />
            Browse Magic Items
          </Link>
        </Button>
        <ViewModeToggleLink view={view} defaultView="table" />
      </div>

      {magicItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No favorite magic items yet. Browse magic items and click the heart
          icon to add favorites!
        </div>
      ) : view === "table" ? (
        <MagicItemTable
          items={magicItems}
          currentUserId={user.id}
          favoritesMap={favoritesMap}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favMagicItems.map(
            (favorite) =>
              favorite.magic_item && (
                <MagicItemCard
                  key={favorite.id}
                  item={favorite.magic_item}
                  currentUserId={user.id}
                  favoriteId={favorite.id}
                  showActions={true}
                />
              ),
          )}
        </div>
      )}
    </div>
  );
}
