"use client";

import { Card, CardContent } from "@/components/ui/card";

interface AbilityScoresCardProps {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export function AbilityScoresCard({
  strength = 0,
  dexterity = 0,
  constitution = 0,
  intelligence = 0,
  wisdom = 0,
  charisma = 0,
}: AbilityScoresCardProps) {
  const formatModifier = (mod: number) => {
    if (mod >= 0) return `+${mod}`;
    return `${mod}`;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Modifiers</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">STR</p>
            <p className="text-2xl font-bold">{formatModifier(strength)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">DEX</p>
            <p className="text-2xl font-bold">{formatModifier(dexterity)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">CON</p>
            <p className="text-2xl font-bold">{formatModifier(constitution)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">INT</p>
            <p className="text-2xl font-bold">{formatModifier(intelligence)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">WIS</p>
            <p className="text-2xl font-bold">{formatModifier(wisdom)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">CHA</p>
            <p className="text-2xl font-bold">{formatModifier(charisma)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
