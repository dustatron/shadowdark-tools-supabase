"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MonsterStatBlock } from "@/src/components/monsters/MonsterStatBlock";
import { MonsterAttacksDisplay } from "@/src/components/monsters/MonsterAttacksDisplay";
import { MonsterAbilitiesDisplay } from "@/src/components/monsters/MonsterAbilitiesDisplay";
import { MonsterOwnershipCard } from "@/src/components/monsters/MonsterOwnershipCard";
import {
  ArrowLeft,
  AlertCircle,
  Pencil,
  Trash2,
  MoreVertical,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { LoadingOverlay } from "@/components/ui/loading-overlay";
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
  monster_type?: "official" | "user" | "custom";
  creator_id?: string;
  user_id?: string;
  is_public?: boolean;
  author?: Author | null;
  created_at?: string;
  updated_at?: string;
}

export default function MonsterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monsterId = params?.id as string;

  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    if (monsterId) {
      fetchMonster();
      checkCurrentUser();
    }
  }, [monsterId]);

  const checkCurrentUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);

    // Fetch favorite status if user is logged in
    if (user && monsterId) {
      const { data: favorite } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", "monster")
        .eq("item_id", monsterId)
        .single();

      setFavoriteId(favorite?.id || null);
    }
  };

  const fetchMonster = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/monsters/${monsterId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Monster not found");
        } else {
          setError("Failed to load monster");
        }
        return;
      }

      const data = await response.json();
      setMonster(data);
    } catch (err) {
      console.error("Error fetching monster:", err);
      setError("An error occurred while loading the monster");
    } finally {
      setLoading(false);
    }
  };

  const challengeLevelColor = monster
    ? monster.challenge_level <= 3
      ? "green"
      : monster.challenge_level <= 7
        ? "yellow"
        : monster.challenge_level <= 12
          ? "orange"
          : "red"
    : "gray";

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
    if (!monster) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/monsters/${monsterId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete monster");
      }

      toast.success("Success", {
        description: "Monster deleted successfully",
      });

      router.push("/monsters");
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
    if (!monster) return;

    // Check if user is logged in
    if (!currentUser) {
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
    if (!monster || !isOwner) return;

    try {
      const response = await fetch(`/api/monsters/${monsterId}`, {
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

  const isOwner = currentUser && monster && monster.user_id === currentUser.id;

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/monsters" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Monsters
        </Link>
      </Button>

      {loading && (
        <Card className="shadow-sm relative min-h-[400px]">
          <CardContent className="p-6">
            <LoadingOverlay visible={true} />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {monster && !loading && !error && (
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {currentUser && monster && (
                    <FavoriteButton
                      itemId={monster.id}
                      itemType="monster"
                      initialFavoriteId={favoriteId || undefined}
                    />
                  )}

                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/monsters/${monsterId}/edit`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Monster
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive flex items-center gap-2 cursor-pointer"
                            onClick={() => setDeleteModalOpen(true)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Monster
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={handleDuplicate}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate Monster
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            isOwner={isOwner}
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
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Monster</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{monster?.name}&quot;? This
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
