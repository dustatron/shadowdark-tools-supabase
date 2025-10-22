"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, Sparkles, Dice6, Heart } from "lucide-react";
import type { DashboardTab } from "@/lib/types/profile.types";

interface DashboardTabsProps {
  initialTab?: DashboardTab;
  monstersContent: React.ReactNode;
  spellsContent: React.ReactNode;
  encountersContent: React.ReactNode;
  favMonstersContent: React.ReactNode;
  favSpellsContent: React.ReactNode;
}

export function DashboardTabs({
  initialTab = "monsters",
  monstersContent,
  spellsContent,
  encountersContent,
  favMonstersContent,
  favSpellsContent,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue={initialTab}>
      <TabsList>
        <TabsTrigger value="monsters" className="flex items-center gap-2">
          <Swords size={16} />
          Monsters
        </TabsTrigger>
        <TabsTrigger value="spells" className="flex items-center gap-2">
          <Sparkles size={16} />
          Spells
        </TabsTrigger>
        <TabsTrigger value="encounters" className="flex items-center gap-2">
          <Dice6 size={16} />
          Encounters
        </TabsTrigger>
        <TabsTrigger
          value="favorite-monsters"
          className="flex items-center gap-2"
        >
          <Heart size={16} />
          Fav Monsters
        </TabsTrigger>
        <TabsTrigger
          value="favorite-spells"
          className="flex items-center gap-2"
        >
          <Heart size={16} />
          Fav Spells
        </TabsTrigger>
      </TabsList>

      <TabsContent value="monsters" className="mt-4">
        {monstersContent}
      </TabsContent>
      <TabsContent value="spells" className="mt-4">
        {spellsContent}
      </TabsContent>
      <TabsContent value="encounters" className="mt-4">
        {encountersContent}
      </TabsContent>
      <TabsContent value="favorite-monsters" className="mt-4">
        {favMonstersContent}
      </TabsContent>
      <TabsContent value="favorite-spells" className="mt-4">
        {favSpellsContent}
      </TabsContent>
    </Tabs>
  );
}
