"use client";

import { SpellCard } from "@/components/spells/SpellCard";
import { SpellTable } from "@/components/spells/SpellTable";
import { useViewMode } from "@/lib/hooks";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { Button } from "@/components/primitives/button";
import { Library } from "lucide-react";
import Link from "next/link";
import type { AllSpell, SpellWithAuthor } from "@/lib/types/spells";

interface FavoriteSpell {
  id: string;
  item_id: string;
  spell: AllSpell | null;
}

interface FavoriteSpellsClientProps {
  favorites: FavoriteSpell[];
  currentUserId: string;
}

export function FavoriteSpellsClient({
  favorites,
  currentUserId,
}: FavoriteSpellsClientProps) {
  const { view, setView } = useViewMode();

  // Extract spells and build favorites map
  const spells = favorites
    .filter((fav) => fav.spell !== null)
    .map((fav) => fav.spell!);

  const favoritesMap = new Map(
    favorites
      .filter((fav) => fav.spell !== null)
      .map((fav) => [fav.item_id, fav.id]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/spells">
            <Library className="mr-2 h-4 w-4" />
            Browse Spells
          </Link>
        </Button>
        <ViewModeToggle view={view} onViewChange={setView} />
      </div>

      {spells.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No favorite spells yet. Browse spells and click the heart icon to add
          favorites!
        </div>
      ) : view === "table" ? (
        <SpellTable
          spells={spells}
          currentUserId={currentUserId}
          favoritesMap={favoritesMap}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(
            (favorite) =>
              favorite.spell && (
                <SpellCard
                  key={favorite.id}
                  spell={favorite.spell as SpellWithAuthor}
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
