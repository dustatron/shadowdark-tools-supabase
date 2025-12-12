import { createClient } from "@/lib/supabase/server";
import { SpellDetailClient } from "./SpellDetailClient";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/primitives/button";
import { Alert, AlertDescription } from "@/components/primitives/alert";

export default async function SpellDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: spellSlug } = await params;
  const supabase = await createClient();

  // Fetch user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch spell from all_spells view
  const { data: spell, error } = await supabase
    .from("all_spells")
    .select("*")
    .eq("slug", spellSlug)
    .single();

  // If spell not found, return 404
  if (error || !spell) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/spells">
            <ArrowLeft className="h-4 w-4" />
            Back to Spells
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Spell not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch favorite status if user is logged in
  let favoriteId: string | null = null;
  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", "spell")
      .eq("item_id", spell.id)
      .single();

    favoriteId = favorite?.id || null;
  }

  return (
    <SpellDetailClient
      spell={spell}
      currentUserId={user?.id || null}
      favoriteId={favoriteId}
    />
  );
}
