import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import { MonsterCard } from "@/src/components/monsters/MonsterCard";
import { getFavoriteMonsters } from "@/lib/api/dashboard";

export default async function FavoriteMonstersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favMonsters = await getFavoriteMonsters(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Favorite Monsters</h2>
        <Button asChild variant="outline">
          <Link href="/monsters">
            <Library className="mr-2 h-4 w-4" />
            Browse Monsters
          </Link>
        </Button>
      </div>
      {favMonsters.length > 0 ? (
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
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No favorite monsters yet. Browse monsters and click the heart icon to
          add favorites!
        </div>
      )}
    </div>
  );
}
