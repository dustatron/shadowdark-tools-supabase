"use client";

import { Card, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitives/tooltip";
import {
  getAlignmentLabel,
  getAlignmentColor,
} from "@/lib/utils/shadowdark-colors";

interface AbilityScoresCardProps {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  alignment?: "L" | "N" | "C" | null;
}

export function AbilityScoresCard({
  strength = 0,
  dexterity = 0,
  constitution = 0,
  intelligence = 0,
  wisdom = 0,
  charisma = 0,
  alignment,
}: AbilityScoresCardProps) {
  const formatModifier = (mod: number) => {
    if (mod >= 0) return `+${mod}`;
    return `${mod}`;
  };

  const abilities = [
    { abbr: "S", full: "Strength", value: strength },
    { abbr: "D", full: "Dexterity", value: dexterity },
    { abbr: "C", full: "Constitution", value: constitution },
    { abbr: "I", full: "Intelligence", value: intelligence },
    { abbr: "W", full: "Wisdom", value: wisdom },
    { abbr: "CH", full: "Charisma", value: charisma },
  ];

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Modifiers</h3>
          {alignment && (
            <Badge
              className={`${getAlignmentColor(alignment)} text-sm px-2 py-1`}
            >
              {getAlignmentLabel(alignment)}
            </Badge>
          )}
        </div>
        <TooltipProvider>
          <div className="flex flex-wrap gap-3 text-base">
            {abilities.map((ability, index) => (
              <span key={ability.abbr} className="inline-flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-semibold cursor-help">
                      {ability.abbr}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{ability.full}</p>
                  </TooltipContent>
                </Tooltip>
                <span className="ml-1">{formatModifier(ability.value)}</span>
                {index < abilities.length - 1 && (
                  <span className="ml-1 text-muted-foreground">,</span>
                )}
              </span>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
