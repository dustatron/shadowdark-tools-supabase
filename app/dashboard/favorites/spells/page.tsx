import { createClient } from "@/lib/supabase/server";
import { getFavoriteSpells } from "@/lib/api/dashboard";
import { SpellCard } from "@/components/spells/SpellCard";
import { SpellTable } from "@/components/spells/SpellTable";
import { ViewModeToggleLink } from "@/components/shared/ViewModeToggleLink";
import { Button } from "@/components/primitives/button";
import { Library } from "lucide-react";
import Link from "next/link";
import type { ViewMode } from "@/lib/types/monsters";
import type { AllSpell, SpellWithAuthor } from "@/lib/types/spells";

interface FavoriteSpellsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FavoriteSpellsPage({
  searchParams,
}: FavoriteSpellsPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favSpells = await getFavoriteSpells(user.id);

  // Get view mode from URL params (default to cards)
  const view: ViewMode = params.view === "table" ? "table" : "cards";

  // Extract spells and build favorites map
  const spells = favSpells
    .filter((fav) => fav.spell !== null)
    .map((fav) => fav.spell as AllSpell);

  const favoritesMap = new Map(
    favSpells
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
        <ViewModeToggleLink view={view} />
      </div>

      {spells.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No favorite spells yet. Browse spells and click the heart icon to add
          favorites!
        </div>
      ) : view === "table" ? (
        <SpellTable
          spells={spells}
          currentUserId={user.id}
          favoritesMap={favoritesMap}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favSpells.map(
            (favorite) =>
              favorite.spell && (
                <SpellCard
                  key={favorite.id}
                  spell={favorite.spell as SpellWithAuthor}
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
