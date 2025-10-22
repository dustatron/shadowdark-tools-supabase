"use client";

import {
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Heart,
  Sword,
  Shield,
  Footprints,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{
    name: string;
    type: "melee" | "ranged";
    damage: string;
    range: string;
    description?: string;
  }>;
  abilities: Array<{
    name: string;
    description: string;
  }>;
  tags: {
    type: string[];
    location: string[];
  };
  source: string;
  author_notes?: string;
  monster_type?: "official" | "user";
  creator_id?: string;
}

interface MonsterCardProps {
  monster: Monster;
  currentUserId?: string;
  onEdit?: (monster: Monster) => void;
  onDelete?: (monster: Monster) => void;
  onToggleFavorite?: (monster: Monster) => void;
  isFavorited?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function MonsterCard({
  monster,
  currentUserId,
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorited = false,
  showActions = true,
  compact = false,
}: MonsterCardProps) {
  const [expanded, setExpanded] = useState(false);

  const canEdit =
    monster.monster_type === "user" && monster.creator_id === currentUserId;
  const canDelete = canEdit;

  const challengeLevelColor =
    monster.challenge_level <= 3
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : monster.challenge_level <= 7
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : monster.challenge_level <= 12
          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  const cardContent = (
    <Card
      className={`shadow-sm ${!showActions ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold line-clamp-1">
                    {monster.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={challengeLevelColor}>
                      Level {monster.challenge_level}
                    </Badge>
                    <Badge variant="outline">{monster.source}</Badge>
                    {monster.monster_type === "user" && (
                      <Badge variant="secondary">Custom</Badge>
                    )}
                  </div>
                </div>

                {showActions && (
                  <div className="flex items-center gap-2">
                    {onToggleFavorite && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFavorite(monster)}
                        className={
                          isFavorited ? "text-red-500" : "text-gray-500"
                        }
                      >
                        {isFavorited ? (
                          <Heart size={16} />
                        ) : (
                          <Heart size={16} />
                        )}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-48">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/monsters/${monster.id}`}
                            className="flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View Details
                          </Link>
                        </DropdownMenuItem>

                        {canEdit && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(monster)}>
                            <Pencil size={14} className="mr-2" />
                            Edit Monster
                          </DropdownMenuItem>
                        )}

                        {canDelete && onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(monster)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Monster
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>

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
            {monster.tags.location?.map((location, index) => (
              <Badge
                key={`location-${index}`}
                variant="outline"
                className="text-gray-600"
              >
                {location}
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
                  onClick={() => setExpanded(!expanded)}
                  className="w-full"
                >
                  {expanded ? "Hide Details" : "Show Details"}
                  {expanded ? (
                    <ChevronUp size={14} className="ml-2" />
                  ) : (
                    <ChevronDown size={14} className="ml-2" />
                  )}
                </Button>

                {expanded && (
                  <div className="flex flex-col gap-4">
                    {/* Attacks */}
                    {monster.attacks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sword size={16} />
                          <h4 className="text-sm font-medium">Attacks</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                          {monster.attacks?.map((attack, index) => (
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
                    {monster.abilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Abilities</h4>
                        <div className="flex flex-col gap-2">
                          {monster.abilities?.map((ability, index) => (
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
        </div>
      </CardContent>
    </Card>
  );

  // If showActions is false, wrap in Link to make whole card clickable
  if (!showActions) {
    return (
      <Link href={`/monsters/${monster.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
