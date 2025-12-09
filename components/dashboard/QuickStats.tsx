import { Card, CardContent } from "@/components/primitives/card";
import { Swords, Sparkles, Dice6, Heart } from "lucide-react";
import type { ProfileStats } from "@/lib/types/profile.types";

interface QuickStatsProps {
  stats: ProfileStats;
}

const statItems = [
  {
    key: "monstersCount",
    label: "Monsters",
    icon: Swords,
    color: "text-red-500",
  },
  {
    key: "spellsCount",
    label: "Spells",
    icon: Sparkles,
    color: "text-blue-500",
  },
  {
    key: "encounterTablesCount",
    label: "Encounters",
    icon: Dice6,
    color: "text-green-500",
  },
  {
    key: "favoriteMonstersCount",
    label: "Fav Monsters",
    icon: Heart,
    color: "text-pink-500",
  },
  {
    key: "favoriteSpellsCount",
    label: "Fav Spells",
    icon: Heart,
    color: "text-pink-500",
  },
];

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const count = stats[item.key as keyof ProfileStats];

        return (
          <Card key={item.key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Icon size={24} className={item.color} />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
