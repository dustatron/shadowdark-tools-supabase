import { createClient } from "@/lib/supabase/server";
import { getFavoriteMonsters } from "@/lib/api/dashboard";
import { MonsterCard } from "@/components/monsters/MonsterCard";
import { MonsterTable } from "@/components/monsters/MonsterTable";
import { ViewModeToggleLink } from "@/components/shared/ViewModeToggleLink";
import { Button } from "@/components/primitives/button";
import { Library } from "lucide-react";
import Link from "next/link";
import type { ViewMode, AllMonster } from "@/lib/types/monsters";

interface FavoriteMonstersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FavoriteMonstersPage({
  searchParams,
}: FavoriteMonstersPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favMonsters = await getFavoriteMonsters(user.id);

  // Get view mode from URL params (default to cards)
  const view: ViewMode = params.view === "table" ? "table" : "cards";

  // Extract monsters and build favorites map
  const monsters = favMonsters
    .filter((fav) => fav.monster !== null)
    .map((fav) => fav.monster as AllMonster);

  const favoritesMap = new Map(
    favMonsters
      .filter((fav) => fav.monster !== null)
      .map((fav) => [fav.item_id, fav.id]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/monsters">
            <Library className="mr-2 h-4 w-4" />
            Browse Monsters
          </Link>
        </Button>
        <ViewModeToggleLink view={view} />
      </div>

      {monsters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No favorite monsters yet. Browse monsters and click the heart icon to
          add favorites!
        </div>
      ) : view === "table" ? (
        <MonsterTable
          monsters={monsters}
          currentUserId={user.id}
          favoritesMap={favoritesMap}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favMonsters.map(
            (favorite) =>
              favorite.monster && (
                <MonsterCard
                  key={favorite.id}
                  monster={favorite.monster}
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
