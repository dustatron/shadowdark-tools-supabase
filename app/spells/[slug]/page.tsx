"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/primitives/alert";
import { Spinner } from "@/components/ui/spinner";
import { SpellDetailBlock } from "@/components/spells/SpellDetailBlock";
import { ArrowLeft, AlertCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

export default function SpellDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spellSlug = params?.slug as string;

  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (spellSlug) {
      fetchSpell();
      checkCurrentUser();
    }
  }, [spellSlug]);

  const checkCurrentUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchSpell = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("all_spells")
        .select("*")
        .eq("slug", spellSlug)
        .single();

      if (fetchError || !data) {
        setError("Spell not found");
        return;
      }

      setSpell(data);

      // Fetch favorite status if user is logged in
      if (currentUserId && data.id) {
        const supabase = createClient();
        const { data: favorite } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", currentUserId)
          .eq("item_type", "spell")
          .eq("item_id", data.id)
          .single();

        setFavoriteId(favorite?.id || null);
      }
    } catch (err) {
      logger.error("Error fetching spell:", err);
      setError("An error occurred while loading the spell");
    } finally {
      setLoading(false);
    }
  };

  const getTierVariant = (
    tier: number,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (tier <= 1) return "secondary";
    if (tier <= 2) return "default";
    if (tier <= 3) return "outline";
    return "destructive";
  };

  const handleDelete = async () => {
    if (!spell) return;

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

  const isOwner = spell && currentUserId && spell.user_id === currentUserId;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/spells">
          <ArrowLeft className="h-4 w-4" />
          Back to Spells
        </Link>
      </Button>

      {loading && (
        <Card className="min-h-[400px] flex items-center justify-center">
          <CardContent>
            <Spinner size="lg" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {spell && !loading && !error && (
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
                  {currentUserId && spell && (
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
      )}
    </div>
  );
}
