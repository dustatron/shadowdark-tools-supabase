"use client";

import { Card, CardContent } from "@/components/primitives/card";
import { Separator } from "@/components/primitives/separator";
import type { MonsterAbility } from "@/lib/types/database";

interface MonsterAbilitiesDisplayProps {
  abilities: MonsterAbility[];
  title?: string;
}

export function MonsterAbilitiesDisplay({
  abilities,
  title = "Special Abilities",
}: MonsterAbilitiesDisplayProps) {
  if (!abilities || !Array.isArray(abilities) || abilities.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex flex-col gap-4">
          {abilities.map((ability, index) => (
            <div key={index}>
              <p className="text-lg font-semibold mb-2">{ability.name}</p>
              <p className="text-sm">{ability.description}</p>
              {index < abilities.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
