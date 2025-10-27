import { createClient } from "@/lib/supabase/server";
import { MonsterDetailClient } from "./MonsterDetailClient";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateBackUrl } from "@/lib/utils";

export default async function MonsterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: monsterId } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const backUrl = generateBackUrl(resolvedSearchParams);

  // Fetch user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // First try to find the monster in all_monsters view (includes official and public custom monsters)
  let { data: monster, error } = await supabase
    .from("all_monsters")
    .select(
      `
      id,
      name,
      challenge_level,
      hit_points,
      armor_class,
      speed,
      attacks,
      abilities,
      tags,
      source,
      author_notes,
      monster_type,
      user_id,
      is_public,
      created_at,
      updated_at
    `,
    )
    .eq("id", monsterId)
    .single();

  // If not found in all_monsters, try user_monsters directly (for private custom monsters)
  if (!monster || error) {
    const { data: userMonster, error: userError } = await supabase
      .from("user_monsters")
      .select(
        `
        id,
        name,
        challenge_level,
        hit_points,
        armor_class,
        speed,
        attacks,
        abilities,
        tags,
        source,
        author_notes,
        user_id,
        is_public,
        created_at,
        updated_at
        `,
      )
      .eq("id", monsterId)
      .single();

    // Monster is accessible if it's public OR user owns it
    if (
      userMonster &&
      (userMonster.is_public || (user && userMonster.user_id === user.id))
    ) {
      monster = {
        ...userMonster,
        monster_type: "custom",
      };
      error = null;
    } else {
      monster = null;
      error = userError || error;
    }
  }

  // If monster not found, return 404
  if (error || !monster) {
    return (
      <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href={backUrl} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Monsters
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Monster not found</AlertDescription>
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
      .eq("item_type", "monster")
      .eq("item_id", monsterId)
      .single();

    favoriteId = favorite?.id || null;
  }

  return (
    <MonsterDetailClient
      monster={monster}
      currentUserId={user?.id || null}
      favoriteId={favoriteId}
    />
  );
}
