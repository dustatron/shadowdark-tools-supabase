"use client";

import { Sword } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Separator } from "@/components/primitives/separator";
import type { MonsterAttack } from "@/lib/types/database";

interface MonsterAttacksDisplayProps {
  attacks: MonsterAttack[];
}

export function MonsterAttacksDisplay({ attacks }: MonsterAttacksDisplayProps) {
  if (!attacks || !Array.isArray(attacks) || attacks.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sword size={20} />
          <h3 className="text-lg font-semibold">Attacks</h3>
        </div>
        <div className="flex flex-col gap-4">
          {attacks.map((attack, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold">{attack.name}</span>
                <Badge variant="outline">{attack.type}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Damage:</strong> {attack.damage}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Range:</strong> {attack.range}
                </p>
              </div>
              {attack.description && (
                <p className="text-sm mt-2">{attack.description}</p>
              )}
              {index < attacks.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
