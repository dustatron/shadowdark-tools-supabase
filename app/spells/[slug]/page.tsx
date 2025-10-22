"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { SpellDetailBlock } from "@/src/components/spells/SpellDetailBlock";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

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
}

export default function SpellDetailPage() {
  const params = useParams();
  const spellSlug = params?.slug as string;

  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

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

      const response = await fetch(`/api/spells/${spellSlug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Spell not found");
        } else {
          setError("Failed to load spell");
        }
        return;
      }

      const data = await response.json();
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
      console.error("Error fetching spell:", err);
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
                {currentUserId && spell && (
                  <FavoriteButton
                    itemId={spell.id}
                    itemType="spell"
                    initialFavoriteId={favoriteId || undefined}
                  />
                )}
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
