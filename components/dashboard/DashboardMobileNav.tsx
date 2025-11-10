"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, Sparkles, Dice6, Heart, Layers } from "lucide-react";

export function DashboardMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentTab = () => {
    if (pathname?.startsWith("/dashboard/decks")) return "decks";
    if (pathname === "/dashboard/monsters") return "monsters";
    if (pathname === "/dashboard/spells") return "spells";
    if (pathname === "/dashboard/encounters") return "encounters";
    if (pathname === "/dashboard/favorites/monsters") return "fav-monsters";
    if (pathname === "/dashboard/favorites/spells") return "fav-spells";
    return "monsters";
  };

  const handleTabChange = (value: string) => {
    const routes: Record<string, string> = {
      decks: "/dashboard/decks",
      monsters: "/dashboard/monsters",
      spells: "/dashboard/spells",
      encounters: "/dashboard/encounters",
      "fav-monsters": "/dashboard/favorites/monsters",
      "fav-spells": "/dashboard/favorites/spells",
    };
    router.push(routes[value]);
  };

  return (
    <div className="w-full border-b bg-background">
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start rounded-none border-b-0 h-auto p-0 bg-transparent">
          <TabsTrigger
            value="decks"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Decks</span>
          </TabsTrigger>
          <TabsTrigger
            value="monsters"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Swords className="h-4 w-4" />
            <span className="hidden sm:inline">Monsters</span>
          </TabsTrigger>
          <TabsTrigger
            value="spells"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Spells</span>
          </TabsTrigger>
          <TabsTrigger
            value="encounters"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Dice6 className="h-4 w-4" />
            <span className="hidden sm:inline">Encounters</span>
          </TabsTrigger>
          <TabsTrigger
            value="fav-monsters"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Fav Monsters</span>
          </TabsTrigger>
          <TabsTrigger
            value="fav-spells"
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Fav Spells</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
