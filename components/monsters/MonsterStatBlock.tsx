"use client";

import { Heart, Shield, Footprints } from "lucide-react";
import { Card, CardContent } from "@/components/primitives/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitives/tooltip";

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
      <TooltipProvider>
        <div className="flex items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Heart size={16} className="text-red-500" />
                <span className="text-sm font-medium">{hitPoints}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hit Points</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Shield size={16} className="text-blue-500" />
                <span className="text-sm font-medium">{armorClass}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Armor Class</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Footprints size={16} className="text-green-500" />
                <span className="text-sm font-medium">{speed}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Speed</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <Heart size={24} className="text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Hit Points
              </p>
              <p className="text-xl font-bold">{hitPoints}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Armor Class
              </p>
              <p className="text-xl font-bold">{armorClass}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Footprints size={24} className="text-green-500" />
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
