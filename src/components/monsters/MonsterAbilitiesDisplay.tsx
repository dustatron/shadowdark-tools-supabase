"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Ability {
  name: string;
  description: string;
}

interface MonsterAbilitiesDisplayProps {
  abilities: Ability[];
  title?: string;
}

export function MonsterAbilitiesDisplay({
  abilities,
  title = "Special Abilities",
}: MonsterAbilitiesDisplayProps) {
  if (abilities.length === 0) {
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
