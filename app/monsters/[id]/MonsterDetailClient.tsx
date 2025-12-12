"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MonsterStatBlock } from "@/components/monsters/MonsterStatBlock";
import { MonsterAttacksDisplay } from "@/components/monsters/MonsterAttacksDisplay";
import { MonsterAbilitiesDisplay } from "@/components/monsters/MonsterAbilitiesDisplay";
import { MonsterOwnershipCard } from "@/components/monsters/MonsterOwnershipCard";
import { AbilityScoresCard } from "@/components/monsters/AbilityScoresCard";
import { ArrowLeft, Pencil, Trash2, MoreVertical, Copy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/primitives/button";
import { Card, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
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
import { getChallengeLevelColor } from "@/lib/utils/shadowdark-colors";
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

      <div className="flex flex-col gap-6">
        {/* Header */}
        <Card className="shadow-sm border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{monster.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`${challengeLevelColor} text-base px-3 py-1`}
                  >
                    Challenge Level {monster.challenge_level}
                  </Badge>
                  {monster.source === "Shadowdark Core" ? (
                    <a
                      href="https://www.thearcanelibrary.com/collections/shadowdark-core-rules/products/shadowdark-rpg-quickstart-set-pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge
                        variant="outline"
                        className="text-base px-3 py-1 hover:bg-accent"
                      >
                        {monster.source}
                      </Badge>
                    </a>
                  ) : (
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {monster.source}
                    </Badge>
                  )}
                  {monster.monster_type === "user" && (
                    <Badge
                      variant="secondary"
                      className="text-base px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      Custom
                    </Badge>
                  )}
                  {monster.is_public && (
                    <Badge
                      variant="secondary"
                      className="text-base px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
              <p className="text-base text-muted-foreground mb-4">
                {monster.description}
              </p>
            )}

            {/* Author Notes */}
            {monster.author_notes &&
              monster.author_notes !== monster.description && (
                <p className="text-base text-muted-foreground mb-4 italic">
                  {monster.author_notes}
                </p>
              )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {monster.tags?.type?.map((type, index) => (
                <Badge key={`type-${index}`} variant="secondary">
                  {type}
                </Badge>
              ))}
              {monster.tags?.location?.map((location, index) => (
                <Badge
                  key={`location-${index}`}
                  variant="outline"
                  className="text-gray-600 dark:text-gray-400"
                >
                  {location}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Art/Icon */}
        {(monster.art_url || monster.icon_url) && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <MonsterStatBlock
          hitPoints={monster.hit_points}
          armorClass={monster.armor_class}
          speed={monster.speed}
        />

        {/* Ability Scores */}
        <AbilityScoresCard
          strength={monster.strength_mod}
          dexterity={monster.dexterity_mod}
          constitution={monster.constitution_mod}
          intelligence={monster.intelligence_mod}
          wisdom={monster.wisdom_mod}
          charisma={monster.charisma_mod}
        />

        {/* Attacks */}
        <MonsterAttacksDisplay attacks={monster.attacks} />

        {/* Abilities */}
        <MonsterAbilitiesDisplay abilities={monster.abilities} />

        {/* Treasure */}
        {monster.treasure && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Treasure</h3>
              <div className="text-sm">
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
                      <ul className="list-disc pl-5 mt-1">
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

        {/* Tactics */}
        {monster.tactics && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Tactics</h3>
              <p className="text-sm">{monster.tactics}</p>
            </CardContent>
          </Card>
        )}

        {/* Wants */}
        {monster.wants && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Wants</h3>
              <p className="text-sm">{monster.wants}</p>
            </CardContent>
          </Card>
        )}

        {/* GM Notes */}
        {monster.gm_notes && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">GM Notes</h3>
              <p className="text-sm">{monster.gm_notes}</p>
            </CardContent>
          </Card>
        )}

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
