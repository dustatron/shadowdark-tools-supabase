"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MonsterStatBlock } from "@/src/components/monsters/MonsterStatBlock";
import { MonsterAttacksDisplay } from "@/src/components/monsters/MonsterAttacksDisplay";
import { MonsterAbilitiesDisplay } from "@/src/components/monsters/MonsterAbilitiesDisplay";
import { MonsterOwnershipCard } from "@/src/components/monsters/MonsterOwnershipCard";
import { AbilityScoresCard } from "@/src/components/monsters/AbilityScoresCard";
import { ArrowLeft, Pencil, Trash2, MoreVertical, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

interface Author {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username_slug: string | null;
}

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
  // Ability score modifiers
  strength_mod?: number;
  dexterity_mod?: number;
  constitution_mod?: number;
  intelligence_mod?: number;
  wisdom_mod?: number;
  charisma_mod?: number;
  monster_type?: "official" | "user" | "custom";
  creator_id?: string;
  user_id?: string;
  is_public?: boolean;
  author?: Author | null;
  created_at?: string;
  updated_at?: string;
}

interface MonsterDetailClientProps {
  monster: Monster;
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
  const [monster, setMonster] = useState<Monster>(initialMonster);
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

  const challengeLevelColor =
    monster.challenge_level <= 3
      ? "green"
      : monster.challenge_level <= 7
        ? "yellow"
        : monster.challenge_level <= 12
          ? "orange"
          : "red";

  const getChallengeColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      green:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      yellow:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      orange:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colorMap[color] || colorMap.gray;
  };

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
      console.error("Error deleting monster:", err);
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
      console.error("Error duplicating monster:", err);
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
      console.error("Error toggling visibility:", err);
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
                    className={`${getChallengeColorClass(challengeLevelColor)} text-base px-3 py-1`}
                  >
                    Challenge Level {monster.challenge_level}
                  </Badge>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {monster.source}
                  </Badge>
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
            {monster.author_notes && (
              <p className="text-base text-muted-foreground mb-4">
                {monster.author_notes}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {monster.tags.type.map((type, index) => (
                <Badge key={`type-${index}`} variant="secondary">
                  {type}
                </Badge>
              ))}
              {monster.tags.location.map((location, index) => (
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
