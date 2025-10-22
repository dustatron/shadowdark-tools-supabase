import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
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
          monstersContent={<div>Monsters: {monsters.length}</div>}
          spellsContent={<div>Spells: {spells.length}</div>}
          encountersContent={<div>Encounters: {encounters.length}</div>}
          favMonstersContent={<div>Fav Monsters: {favMonsters.length}</div>}
          favSpellsContent={<div>Fav Spells: {favSpells.length}</div>}
        />
      </div>
    </div>
  );
}
