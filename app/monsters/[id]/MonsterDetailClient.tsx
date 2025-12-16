"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MonsterStatBlock } from "@/components/monsters/MonsterStatBlock";
import { MonsterOwnershipCard } from "@/components/monsters/MonsterOwnershipCard";
import { ArrowLeft, Sword } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/primitives/button";
import { Card, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Separator } from "@/components/primitives/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/primitives/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { logger } from "@/lib/utils/logger";
import {
  getChallengeLevelColor,
  getAlignmentLabel,
  getAlignmentColor,
} from "@/lib/utils/shadowdark-colors";
import type { MonsterWithAuthor, MonsterAuthor } from "@/lib/types/monsters";

// Re-export Author type for backwards compatibility
type Author = MonsterAuthor;

interface MonsterDetailClientProps {
  monster: MonsterWithAuthor;
  currentUserId: string | null;
  favoriteId: string | null;
}

export function MonsterDetailClient({
  monster: initialMonster,
  currentUserId,
  favoriteId,
}: MonsterDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [monster, setMonster] = useState<MonsterWithAuthor>(initialMonster);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [backUrl, setBackUrl] = useState("/monsters");

  // Generate back URL with preserved query parameters
  useEffect(() => {
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
    setBackUrl(queryString ? `/monsters?${queryString}` : "/monsters");
  }, [searchParams]);

  const challengeLevelColor = getChallengeLevelColor(monster.challenge_level);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/monsters/${monster.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete monster");
      }

      toast.success("Success", {
        description: "Monster deleted successfully",
      });

      router.push(backUrl);
    } catch (err) {
      logger.error("Error deleting monster:", err);
      toast.error("Error", {
        description: "Failed to delete monster",
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleDuplicate = async () => {
    // Check if user is logged in
    if (!currentUserId) {
      // Redirect to login page
      router.push("/auth/login");
      return;
    }

    try {
      // Create a copy of the monster without the ID
      const { id, user_id, ...monsterData } = monster;
      const duplicateData = {
        ...monsterData,
        name: `${monster.name} (Copy)`,
        is_public: false,
      };

      const response = await fetch("/api/monsters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate monster");
      }

      const newMonster = await response.json();

      toast.success("Success", {
        description: "Monster duplicated successfully",
      });

      router.push(`/monsters/${newMonster.id}`);
    } catch (err) {
      logger.error("Error duplicating monster:", err);
      toast.error("Error", {
        description: "Failed to duplicate monster",
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/monsters/${monster.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_public: !monster.is_public,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const updatedMonster = await response.json();
      setMonster(updatedMonster);

      toast.success("Success", {
        description: `Monster is now ${updatedMonster.is_public ? "public" : "private"}`,
      });
    } catch (err) {
      logger.error("Error toggling visibility:", err);
      toast.error("Error", {
        description: "Failed to update monster visibility",
      });
    }
  };

  const isOwner = currentUserId && monster.user_id === currentUserId;

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href={backUrl} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Monsters
        </Link>
      </Button>

      <div className="flex flex-col gap-4">
        {/* Main Monster Card - Consolidated */}
        <Card className="shadow-sm border">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{monster.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${challengeLevelColor} text-sm px-2 py-1`}>
                    Level {monster.challenge_level}
                  </Badge>

                  {monster.source === "Shadowdark Core" ? (
                    <a
                      href="https://www.thearcanelibrary.com/collections/shadowdark-core-rules/products/shadowdark-rpg-quickstart-set-pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge
                        variant="outline"
                        className="text-sm px-2 py-1 hover:bg-accent"
                      >
                        {monster.source}
                      </Badge>
                    </a>
                  ) : (
                    <Badge variant="outline" className="text-sm px-2 py-1">
                      {monster.source}
                    </Badge>
                  )}
                  {monster.monster_type === "user" && (
                    <Badge
                      variant="secondary"
                      className="text-sm px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      Custom
                    </Badge>
                  )}
                  {monster.is_public && (
                    <Badge
                      variant="secondary"
                      className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Public
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUserId && (
                  <FavoriteButton
                    itemId={monster.id}
                    itemType="monster"
                    initialFavoriteId={favoriteId || undefined}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            {monster.description && (
              <p className="text-sm text-muted-foreground">
                {monster.description}
              </p>
            )}

            {/* Art/Icon */}
            {(monster.art_url || monster.icon_url) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {monster.art_url && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Art</h3>
                      <Image
                        src={monster.art_url}
                        alt={`${monster.name} art`}
                        width={448}
                        height={300}
                        className="max-w-md w-full rounded-lg border"
                      />
                    </div>
                  )}
                  {monster.icon_url && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Icon</h3>
                      <Image
                        src={monster.icon_url}
                        alt={`${monster.name} icon`}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Stats */}
            <Separator />
            <MonsterStatBlock
              hitPoints={monster.hit_points}
              armorClass={monster.armor_class}
              speed={monster.speed}
              compact
            />

            {/* Modifiers with Alignment */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Modifiers</h3>
                {monster.alignment && (
                  <Badge
                    className={`${getAlignmentColor(monster.alignment)} text-xs px-2 py-0.5`}
                  >
                    {getAlignmentLabel(monster.alignment)}
                  </Badge>
                )}
              </div>
              <TooltipProvider>
                <div className="flex flex-wrap gap-2 text-sm">
                  {[
                    {
                      abbr: "S",
                      full: "Strength",
                      value: monster.strength_mod,
                    },
                    {
                      abbr: "D",
                      full: "Dexterity",
                      value: monster.dexterity_mod,
                    },
                    {
                      abbr: "C",
                      full: "Constitution",
                      value: monster.constitution_mod,
                    },
                    {
                      abbr: "I",
                      full: "Intelligence",
                      value: monster.intelligence_mod,
                    },
                    { abbr: "W", full: "Wisdom", value: monster.wisdom_mod },
                    {
                      abbr: "CH",
                      full: "Charisma",
                      value: monster.charisma_mod,
                    },
                  ].map((ability, index) => (
                    <span
                      key={ability.abbr}
                      className="inline-flex items-center"
                    >
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
                      <span className="ml-1">
                        {ability.value >= 0 ? "+" : ""}
                        {ability.value}
                      </span>
                      {index < 5 && (
                        <span className="ml-1 text-muted-foreground">,</span>
                      )}
                    </span>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {/* Attacks */}
            {monster.attacks && monster.attacks.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sword size={18} />
                    <h3 className="text-base font-semibold">Attacks</h3>
                  </div>
                  {monster.attacks.map((attack, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {attack.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {attack.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                        {attack.numberOfAttacks !== undefined && (
                          <span>
                            <strong>Num:</strong> {attack.numberOfAttacks}
                          </span>
                        )}
                        {attack.attackBonus !== undefined && (
                          <span>
                            <strong>To Hit:</strong>{" "}
                            {attack.attackBonus >= 0 ? "+" : ""}
                            {attack.attackBonus}
                          </span>
                        )}
                        <span>
                          <strong>Damage:</strong> {attack.damage}
                        </span>
                        <span>
                          <strong>Range:</strong> {attack.range}
                        </span>
                      </div>
                      {attack.description && (
                        <p className="text-xs mt-1">{attack.description}</p>
                      )}
                      {index < monster.attacks.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Special Abilities */}
            {monster.abilities && monster.abilities.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Special Abilities</h3>
                  {monster.abilities.map((ability, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm font-semibold">{ability.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ability.description}
                      </p>
                      {index < monster.abilities.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Tags */}
            {(monster.tags?.type?.length > 0 ||
              monster.tags?.location?.length > 0) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {monster.tags?.type?.map((type, index) => (
                      <Badge
                        key={`type-${index}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {type}
                      </Badge>
                    ))}
                    {monster.tags?.location?.map((location, index) => (
                      <Badge
                        key={`location-${index}`}
                        variant="outline"
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Treasure */}
            {monster.treasure && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Treasure</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {typeof monster.treasure === "string" ? (
                      <p>{monster.treasure}</p>
                    ) : (
                      <>
                        {monster.treasure.type && (
                          <p>
                            <strong>Type:</strong> {monster.treasure.type}
                          </p>
                        )}
                        {monster.treasure.amount && (
                          <p>
                            <strong>Amount:</strong> {monster.treasure.amount}
                          </p>
                        )}
                        {monster.treasure.items &&
                          monster.treasure.items.length > 0 && (
                            <div>
                              <strong>Items:</strong>
                              <ul className="list-disc pl-4 mt-1">
                                {monster.treasure.items.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Tactics */}
            {monster.tactics && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Tactics</h3>
                  <p className="text-xs">{monster.tactics}</p>
                </div>
              </>
            )}

            {/* Wants */}
            {monster.wants && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Wants</h3>
                  <p className="text-xs">{monster.wants}</p>
                </div>
              </>
            )}

            {/* GM Notes */}
            {monster.gm_notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">GM Notes</h3>
                  <p className="text-xs">{monster.gm_notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ownership/Author Card */}
        <MonsterOwnershipCard
          monsterId={monster.id}
          monsterName={monster.name}
          monsterType={monster.monster_type || "official"}
          isPublic={monster.is_public || false}
          author={monster.author || null}
          isOwner={!!isOwner}
          createdAt={monster.created_at}
          updatedAt={monster.updated_at}
          onDelete={() => setDeleteModalOpen(true)}
          onDuplicate={handleDuplicate}
          onToggleVisibility={
            isOwner &&
            (monster.monster_type === "user" ||
              monster.monster_type === "custom")
              ? handleToggleVisibility
              : undefined
          }
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Monster</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{monster.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Monster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
