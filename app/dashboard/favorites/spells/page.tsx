import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import { SpellCard } from "@/src/components/spells/SpellCard";
import { getFavoriteSpells } from "@/lib/api/dashboard";

export default async function FavoriteSpellsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favSpells = await getFavoriteSpells(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="outline">
          <Link href="/spells">
            <Library className="mr-2 h-4 w-4" />
            Browse Spells
          </Link>
        </Button>
      </div>
      {favSpells.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favSpells.map(
            (favorite) =>
              favorite.spell && (
                <SpellCard
                  key={favorite.id}
                  spell={favorite.spell}
                  currentUserId={user.id}
                  favoriteId={favorite.id}
                  showActions={true}
                />
              ),
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No favorite spells yet. Browse spells and click the heart icon to add
          favorites!
        </div>
      )}
    </div>
  );
}
