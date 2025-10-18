"use client";

import { IconHeart, IconShield, IconRun } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

interface MonsterStatBlockProps {
  hitPoints: number;
  armorClass: number;
  speed: string;
  compact?: boolean;
}

export function MonsterStatBlock({
  hitPoints,
  armorClass,
  speed,
  compact = false,
}: MonsterStatBlockProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <IconHeart size={16} className="text-red-500" />
          <span className="text-sm font-medium">{hitPoints}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconShield size={16} className="text-blue-500" />
          <span className="text-sm font-medium">{armorClass}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconRun size={16} className="text-green-500" />
          <span className="text-sm font-medium">{speed}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <IconHeart size={24} className="text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Hit Points
              </p>
              <p className="text-xl font-bold">{hitPoints}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <IconShield size={24} className="text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Armor Class
              </p>
              <p className="text-xl font-bold">{armorClass}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <IconRun size={24} className="text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Speed</p>
              <p className="text-xl font-bold">{speed}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
