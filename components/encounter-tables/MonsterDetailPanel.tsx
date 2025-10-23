"use client";

import { useState } from "react";
import { Heart, X, Coins } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { MonsterAttacksDisplay } from "@/src/components/monsters/MonsterAttacksDisplay";
import { MonsterAbilitiesDisplay } from "@/src/components/monsters/MonsterAbilitiesDisplay";
import {
  MonsterSnapshot,
  Attack as EncounterAttack,
  Ability as EncounterAbility,
} from "@/lib/encounter-tables/types";
import { cn } from "@/lib/utils";

// Type conversion utilities (encounter types -> monster display types)
function convertAttack(attack: EncounterAttack) {
  return {
    name: attack.name,
    type: (attack.range === "melee" ? "melee" : "ranged") as "melee" | "ranged",
    damage: attack.damage,
    range: attack.range || "melee",
    description: attack.description || undefined,
  };
}

function convertAbility(ability: EncounterAbility) {
  return {
    name: ability.name,
    description: ability.description,
  };
}

interface MonsterDetailPanelProps {
  monster: MonsterSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite?: () => void;
  isFavorited?: boolean;
}

export function MonsterDetailPanel({
  monster,
  open,
  onOpenChange,
  onToggleFavorite,
  isFavorited = false,
}: MonsterDetailPanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  if (typeof window !== "undefined" && !isMobile && window.innerWidth < 768) {
    setIsMobile(true);
  }

  if (!monster) return null;

  const content = (
    <div className="space-y-6">
      {/* Header with favorite button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold">{monster.name}</h2>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isFavorited && "fill-red-500 text-red-500",
                  )}
                />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">CL {monster.challenge_level}</Badge>
            {monster.size && <Badge variant="outline">{monster.size}</Badge>}
            {monster.type && <Badge variant="outline">{monster.type}</Badge>}
            {monster.alignment && (
              <Badge variant="outline">{monster.alignment}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {monster.description && (
        <div>
          <p className="text-sm text-muted-foreground">{monster.description}</p>
        </div>
      )}

      <Separator />

      {/* Core Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Armor Class
              </p>
              <p className="text-xl font-bold">{monster.armor_class}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Hit Points
              </p>
              <p className="text-xl font-bold">{monster.hit_points}</p>
              <p className="text-xs text-muted-foreground">
                {monster.hit_dice}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Speed</p>
              <p className="text-xl font-bold">{monster.speed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ability Scores */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">STR</p>
              <p className="text-lg font-bold">{monster.str}</p>
              <p className="text-sm text-muted-foreground">
                ({monster.str_mod >= 0 ? "+" : ""}
                {monster.str_mod})
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">DEX</p>
              <p className="text-lg font-bold">{monster.dex}</p>
              <p className="text-sm text-muted-foreground">
                ({monster.dex_mod >= 0 ? "+" : ""}
                {monster.dex_mod})
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">CON</p>
              <p className="text-lg font-bold">{monster.con}</p>
              <p className="text-sm text-muted-foreground">
                ({monster.con_mod >= 0 ? "+" : ""}
                {monster.con_mod})
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">INT</p>
              <p className="text-lg font-bold">{monster.int}</p>
              <p className="text-sm text-muted-foreground">
                ({monster.int_mod >= 0 ? "+" : ""}
                {monster.int_mod})
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">WIS</p>
              <p className="text-lg font-bold">{monster.wis}</p>
              <p className="text-sm text-muted-foreground">
                ({monster.wis_mod >= 0 ? "+" : ""}
                {monster.wis_mod})
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase">CHA</p>
              <p className="text-lg font-bold">{monster.cha}</p>
              <p className="text-sm text-muted-foreground">
                ({monster.cha_mod >= 0 ? "+" : ""}
                {monster.cha_mod})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attacks */}
      {monster.attacks.length > 0 && (
        <MonsterAttacksDisplay attacks={monster.attacks.map(convertAttack)} />
      )}

      {/* Abilities */}
      {monster.abilities.length > 0 && (
        <MonsterAbilitiesDisplay
          abilities={monster.abilities.map(convertAbility)}
        />
      )}

      {/* Traits */}
      {monster.traits && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Traits</h3>
            <p className="text-sm whitespace-pre-wrap">{monster.traits}</p>
          </CardContent>
        </Card>
      )}

      {/* Lore */}
      {monster.lore && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Lore</h3>
            <p className="text-sm whitespace-pre-wrap">{monster.lore}</p>
          </CardContent>
        </Card>
      )}

      {/* Treasure */}
      {monster.treasure && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Treasure</h3>
            </div>
            <div className="space-y-2">
              {(monster.treasure.copper > 0 ||
                monster.treasure.silver > 0 ||
                monster.treasure.gold > 0) && (
                <div className="flex gap-4 text-sm">
                  {monster.treasure.copper > 0 && (
                    <span>
                      <strong>{monster.treasure.copper}</strong> cp
                    </span>
                  )}
                  {monster.treasure.silver > 0 && (
                    <span>
                      <strong>{monster.treasure.silver}</strong> sp
                    </span>
                  )}
                  {monster.treasure.gold > 0 && (
                    <span>
                      <strong>{monster.treasure.gold}</strong> gp
                    </span>
                  )}
                </div>
              )}
              {monster.treasure.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-1">Items:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {monster.treasure.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Mobile view - Sheet (drawer from bottom/side)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sr-only">Monster Details</SheetTitle>
          </SheetHeader>
          <div className="pb-6">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view - Dialog (modal)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Monster Details</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
