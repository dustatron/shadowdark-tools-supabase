"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { SpellDetailBlock } from "@/components/spells/SpellDetailBlock";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/primitives/alert-dialog";

interface Spell {
  id: string;
  name: string;
  slug: string;
  description: string;
  classes: string[];
  duration: string;
  range: string;
  tier: number;
  source: string;
  author_notes?: string;
  user_id?: string;
}

interface SpellDetailClientProps {
  spell: Spell;
  currentUserId: string | null;
  favoriteId: string | null;
}

export function SpellDetailClient({
  spell,
  currentUserId,
  favoriteId,
}: SpellDetailClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const getTierVariant = (
    tier: number,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (tier <= 1) return "secondary";
    if (tier <= 2) return "default";
    if (tier <= 3) return "outline";
    return "destructive";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/spells/${spell.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete spell");
      }

      toast.success("Spell deleted successfully");
      router.push("/spells");
    } catch (err) {
      logger.error("Error deleting spell:", err);
      toast.error("Failed to delete spell");
      setIsDeleting(false);
    }
  };

  const isOwner = currentUserId && spell.user_id === currentUserId;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/spells">
          <ArrowLeft className="h-4 w-4" />
          Back to Spells
        </Link>
      </Button>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{spell.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getTierVariant(spell.tier)}>
                    Tier {spell.tier}
                  </Badge>
                  <Badge variant="outline">{spell.source}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {currentUserId && (
                  <FavoriteButton
                    itemId={spell.id}
                    itemType="spell"
                    initialFavoriteId={favoriteId || undefined}
                  />
                )}
                {isOwner && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/spells/${spell.slug}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Spell</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{spell.name}
                            &quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              {spell.description}
            </CardDescription>
          </CardContent>
        </Card>

        <SpellDetailBlock
          tier={spell.tier}
          classes={spell.classes}
          duration={spell.duration}
          range={spell.range}
        />
      </div>
    </div>
  );
}
