"use client";

import {
  ChevronDown,
  ChevronUp,
  Sword,
  Shield,
  Footprints,
  Heart,
  Edit,
} from "lucide-react";
import { useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";

import { Separator } from "@/components/primitives/separator";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { getChallengeLevelColor } from "@/lib/utils/shadowdark-colors";
import { AllMonster } from "@/lib/types/monsters";

interface MonsterCardProps {
  monster: AllMonster;
  currentUserId?: string;
  favoriteId?: string | null;
  onEdit?: (monster: AllMonster) => void;
  onDelete?: (monster: AllMonster) => void;
  showActions?: boolean;
  compact?: boolean;
  preserveSearchParams?: boolean;
}

export const MonsterCard = memo(function MonsterCard({
  monster,
  currentUserId,
  favoriteId,
  showActions = true,
  compact = false,
  preserveSearchParams = false,
}: MonsterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();

  // Memoize toggle handler
  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Memoize URL generation
  const monsterUrl = useMemo(() => {
    if (!preserveSearchParams) {
      return `/monsters/${monster.id}`;
    }

    const params = new URLSearchParams();

    // Preserve all relevant search parameters
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) params.set("q", q);

    const minCl = searchParams.get("min_cl");
    if (minCl) params.set("min_cl", minCl);

    const maxCl = searchParams.get("max_cl");
    if (maxCl) params.set("max_cl", maxCl);

    const types = searchParams.get("types");
    if (types) params.set("types", types);

    const speed = searchParams.get("speed");
    if (speed) params.set("speed", speed);

    const type = searchParams.get("type") || searchParams.get("source");
    if (type && type !== "all") params.set("type", type);

    const page = searchParams.get("page");
    if (page && page !== "1") params.set("page", page);

    const limit = searchParams.get("limit");
    if (limit && limit !== "20") params.set("limit", limit);

    const queryString = params.toString();
    return queryString
      ? `/monsters/${monster.id}?${queryString}`
      : `/monsters/${monster.id}`;
  }, [monster.id, preserveSearchParams, searchParams]);

  // Memoize challenge level color
  const challengeLevelColor = useMemo(
    () => getChallengeLevelColor(monster.challenge_level),
    [monster.challenge_level],
  );

  // Memoize owner check
  const isOwner = useMemo(
    () =>
      currentUserId &&
      (monster.creator_id === currentUserId ||
        monster.user_id === currentUserId),
    [currentUserId, monster.creator_id, monster.user_id],
  );

  const cardContent = (
    <Card
      className={`${!showActions ? "hover:shadow-md transition-shadow cursor-pointer" : ""} `}
    >
      <div className="float-end flex gap-1">
        {showActions && isOwner && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit monster"
            aria-label={`Edit ${monster.name}`}
          >
            <Link href={`/monsters/${monster.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {currentUserId && (
          <FavoriteButton
            itemId={monster.id}
            itemType="monster"
            initialFavoriteId={favoriteId || undefined}
            compact={true}
          />
        )}
      </div>
      <Link href={monsterUrl} className="flex items-center gap-2">
        <CardHeader>
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold line-clamp-1">
              {monster.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Badge className={challengeLevelColor}>
              Level {monster.challenge_level}
            </Badge>
            <Badge variant="outline">
              {monster.source === "Custom" ? "User Create" : "Shadowdark Core"}
            </Badge>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 border-t-2 dark:border-border ">
        {/* Header */}

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2" title="Hit Points">
            <Heart size={16} className="text-red-500" />
            <span className="text-sm font-medium">{monster.hit_points}</span>
          </div>

          <div className="flex items-center gap-2" title="Armor Class">
            <Shield size={16} className="text-blue-500" />
            <span className="text-sm font-medium">{monster.armor_class}</span>
          </div>

          <div className="flex items-center gap-2" title="Speed">
            <Footprints size={16} className="text-green-500" />
            <span className="text-sm font-medium">{monster.speed}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {monster.tags.type?.map((type, index) => (
            <Badge key={`type-${index}`} variant="secondary">
              {type}
            </Badge>
          ))}
        </div>

        {/* Expandable Details */}
        {!compact &&
          (monster.attacks.length > 0 || monster.abilities.length > 0) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="w-full"
                aria-expanded={expanded}
                aria-controls={`monster-details-${monster.id}`}
                aria-label={
                  expanded
                    ? `Hide details for ${monster.name}`
                    : `Show details for ${monster.name}`
                }
              >
                {expanded ? "Hide Details" : "Show Details"}
                {expanded ? (
                  <ChevronUp size={14} className="ml-2" />
                ) : (
                  <ChevronDown size={14} className="ml-2" />
                )}
              </Button>

              {expanded && (
                <div
                  className="flex flex-col gap-4"
                  id={`monster-details-${monster.id}`}
                >
                  {/* Attacks */}
                  {Array.isArray(monster.attacks) &&
                    monster.attacks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sword size={16} />
                          <h4 className="text-sm font-medium">Attacks</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                          {monster.attacks.map((attack, index) => (
                            <div key={index} className="pl-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {attack.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {attack.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {attack.damage} ({attack.range})
                                </span>
                              </div>
                              {attack.description && (
                                <p className="text-xs text-muted-foreground pl-2">
                                  {attack.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Abilities */}
                  {Array.isArray(monster.abilities) &&
                    monster.abilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Abilities</h4>
                        <div className="flex flex-col gap-2">
                          {monster.abilities.map((ability, index) => (
                            <div key={index} className="pl-4">
                              <p className="text-sm font-medium">
                                {ability.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ability.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Author Notes */}
                  {monster.author_notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {monster.author_notes}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
      </CardContent>
    </Card>
  );

  // If showActions is false, wrap in Link to make whole card clickable
  if (!showActions) {
    return (
      <Link href={monsterUrl} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});
