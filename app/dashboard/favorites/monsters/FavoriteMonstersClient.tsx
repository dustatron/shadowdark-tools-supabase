"use client";

import { MonsterCard } from "@/components/monsters/MonsterCard";
import { MonsterTable } from "@/components/monsters/MonsterTable";
import { useViewMode } from "@/lib/hooks";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { Button } from "@/components/primitives/button";
import { Library } from "lucide-react";
import Link from "next/link";
import type { AllMonster } from "@/lib/types/monsters";

interface FavoriteMonster {
  id: string;
  item_id: string;
  monster: AllMonster | null;
}

interface FavoriteMonstersClientProps {
  favorites: FavoriteMonster[];
  currentUserId: string;
}

export function FavoriteMonstersClient({
  favorites,
  currentUserId,
}: FavoriteMonstersClientProps) {
  const { view, setView } = useViewMode();

  // Extract monsters and build favorites map
  const monsters = favorites
    .filter((fav) => fav.monster !== null)
    .map((fav) => fav.monster!);

  const favoritesMap = new Map(
    favorites
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
        <ViewModeToggle view={view} onViewChange={setView} />
      </div>

      {monsters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No favorite monsters yet. Browse monsters and click the heart icon to
          add favorites!
        </div>
      ) : view === "table" ? (
        <MonsterTable
          monsters={monsters}
          currentUserId={currentUserId}
          favoritesMap={favoritesMap}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(
            (favorite) =>
              favorite.monster && (
                <MonsterCard
                  key={favorite.id}
                  monster={favorite.monster}
                  currentUserId={currentUserId}
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
