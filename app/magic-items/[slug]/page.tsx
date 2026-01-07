import { createClient } from "@/lib/supabase/server";
import { TraitsSection } from "@/components/magic-items/TraitsSection";
import { SourceBadge } from "@/components/magic-items/SourceBadge";
import { MagicItemDetailClient } from "./MagicItemDetailClient";
import { Button } from "@/components/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTransformedImageUrl } from "@/lib/utils/cloudinary";
import type { MagicItemWithAuthor } from "@/lib/types/magic-items";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
  item_type?: "official" | "custom";
  user_id?: string | null;
  creator_name?: string | null;
  is_public?: boolean;
  image_url?: string | null;
  is_ai_generated?: boolean;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchMagicItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  currentUserId: string | null,
): Promise<{
  item: MagicItemWithAuthor | null;
  itemType: "official" | "custom";
  creatorName: string | null;
  userId: string | null;
  favoriteId: string | null;
}> {
  // Check for favorite if user is logged in
  let favoriteId: string | null = null;

  // First try to find in official_magic_items
  const { data: officialItem } = await supabase
    .from("official_magic_items")
    .select("*")
    .eq("slug", slug)
    .single();

  if (officialItem) {
    // Check if user has favorited this item
    if (currentUserId) {
      const { data: favorite } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("item_type", "magic_item")
        .eq("item_id", officialItem.id)
        .single();

      favoriteId = favorite?.id || null;
    }

    const item: MagicItemWithAuthor = {
      ...officialItem,
      item_type: "official",
      user_id: null,
      creator_name: null,
      is_public: true,
      author: null,
    };

    return {
      item,
      itemType: "official",
      creatorName: null,
      userId: null,
      favoriteId,
    };
  }

  // Try to find public user item by slug
  const { data: userItem } = await supabase
    .from("user_magic_items")
    .select(
      `
      *,
      user_profiles:user_id (display_name)
    `,
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (userItem) {
    // Check if user has favorited this item
    if (currentUserId) {
      const { data: favorite } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("item_type", "magic_item")
        .eq("item_id", userItem.id)
        .single();

      favoriteId = favorite?.id || null;
    }

    const creator = userItem.user_profiles as { display_name: string } | null;
    const item: MagicItemWithAuthor = {
      ...userItem,
      item_type: "custom",
      creator_name: creator?.display_name || null,
      author: userItem.user_id
        ? {
            id: userItem.user_id,
            display_name: creator?.display_name || null,
            avatar_url: null,
          }
        : null,
    };

    return {
      item,
      itemType: "custom",
      creatorName: creator?.display_name || null,
      userId: userItem.user_id,
      favoriteId,
    };
  }

  // If user is logged in, check if they own a private item with this slug
  if (currentUserId) {
    const { data: ownItem } = await supabase
      .from("user_magic_items")
      .select("*")
      .eq("slug", slug)
      .eq("user_id", currentUserId)
      .single();

    if (ownItem) {
      // Get favorite for own item
      const { data: favorite } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("item_type", "magic_item")
        .eq("item_id", ownItem.id)
        .single();

      favoriteId = favorite?.id || null;

      const item: MagicItemWithAuthor = {
        ...ownItem,
        item_type: "custom",
        creator_name: null,
        author: {
          id: currentUserId,
          display_name: null,
          avatar_url: null,
        },
      };

      return {
        item,
        itemType: "custom",
        creatorName: null,
        userId: ownItem.user_id,
        favoriteId,
      };
    }
  }

  return {
    item: null,
    itemType: "official",
    creatorName: null,
    userId: null,
    favoriteId: null,
  };
}

export default async function MagicItemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { item, itemType, creatorName, userId, favoriteId } =
    await fetchMagicItem(supabase, slug, user?.id || null);

  if (!item) {
    notFound();
  }

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin === true;
  }

  const magicItem = item;
  const isOwner = user && userId === user.id;

  // Group traits by type
  const groupedTraits: Record<string, { name: string; description: string }[]> =
    {
      Benefit: [],
      Curse: [],
      Bonus: [],
      Personality: [],
    };

  magicItem.traits.forEach((trait) => {
    if (groupedTraits[trait.name]) {
      groupedTraits[trait.name].push(trait);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/magic-items">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magic Items
        </Link>
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            {/* Main Info */}
            <div className="flex gap-6">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {magicItem.image_url ? (
                    <Image
                      src={
                        getTransformedImageUrl(magicItem.image_url, "detail") ||
                        ""
                      }
                      alt={magicItem.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Sparkles className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                {magicItem.is_ai_generated && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-3xl">{magicItem.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <SourceBadge
                      itemType={itemType}
                      creatorName={creatorName}
                      userId={userId}
                    />
                    <MagicItemDetailClient
                      item={magicItem}
                      userId={user?.id || null}
                      favoriteId={favoriteId}
                      isOwner={isOwner}
                      isAdmin={isAdmin}
                    />
                  </div>
                </div>
                <p className="text-base leading-relaxed mt-4">
                  {magicItem.description}
                </p>
              </div>
            </div>
          </CardHeader>
          {/* Traits Section */}
          {magicItem.traits.length > 0 && (
            <CardContent>
              <CardTitle className="text-xl mb-4">Traits</CardTitle>
              <TraitsSection
                groupedTraits={{
                  Benefit: groupedTraits.Benefit,
                  Curse: groupedTraits.Curse,
                  Bonus: groupedTraits.Bonus,
                  Personality: groupedTraits.Personality,
                }}
              />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
