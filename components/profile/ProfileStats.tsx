import { Card, CardContent } from "@/components/ui/card";
import { Swords, Sparkles, Dice6 } from "lucide-react";
import type { ProfileStats } from "@/lib/types/profile.types";

interface ProfileStatsProps {
  stats: ProfileStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const items = [
    { label: "Monsters", count: stats.monstersCount, icon: Swords },
    { label: "Spells", count: stats.spellsCount, icon: Sparkles },
    { label: "Encounters", count: stats.encounterTablesCount, icon: Dice6 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Icon size={24} />
                <div>
                  <p className="text-2xl font-bold">{item.count}</p>
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
