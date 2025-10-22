import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { MonsterCard } from "@/src/components/monsters/MonsterCard";
import { SpellCard } from "@/src/components/spells/SpellCard";
import { getProfileStats } from "@/lib/api/profiles";
import {
  getUserMonsters,
  getUserSpells,
  getUserEncounterTables,
  getFavoriteMonsters,
  getFavoriteSpells,
} from "@/lib/api/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch all data in parallel
  const [stats, monsters, spells, encounters, favMonsters, favSpells] =
    await Promise.all([
      getProfileStats(user.id),
      getUserMonsters(user.id),
      getUserSpells(user.id),
      getUserEncounterTables(user.id),
      getFavoriteMonsters(user.id),
      getFavoriteSpells(user.id),
    ]);

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <Button asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        <QuickStats stats={stats} />

        <DashboardTabs
          monstersContent={
            monsters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monsters.map((monster) => (
                  <MonsterCard
                    key={monster.id}
                    monster={monster}
                    currentUserId={user.id}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No custom monsters yet. Create your first monster to get
                started!
              </div>
            )
          }
          spellsContent={
            spells.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spells.map((spell) => (
                  <SpellCard
                    key={spell.id}
                    spell={spell}
                    currentUserId={user.id}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No custom spells yet. Create your first spell to get started!
              </div>
            )
          }
          encountersContent={<div>Encounters: {encounters.length}</div>}
          favMonstersContent={
            favMonsters.length > 0 ? (
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
                No favorite monsters yet. Browse monsters and click the heart
                icon to add favorites!
              </div>
            )
          }
          favSpellsContent={
            favSpells.length > 0 ? (
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
                No favorite spells yet. Browse spells and click the heart icon
                to add favorites!
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
