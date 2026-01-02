import { createClient } from "@/lib/supabase/server";
import { TraitsSection } from "@/components/magic-items/TraitsSection";
import { SourceBadge } from "@/components/magic-items/SourceBadge";
import { UserMagicItemActions } from "@/components/magic-items/UserMagicItemActions";
import { Button } from "@/components/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTransformedImageUrl } from "@/lib/utils/cloudinary";

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
  item: MagicItem | null;
  itemType: "official" | "custom";
  creatorName: string | null;
  userId: string | null;
}> {
  // First try to find in official_magic_items
  const { data: officialItem } = await supabase
    .from("official_magic_items")
    .select("*")
    .eq("slug", slug)
    .single();

  if (officialItem) {
    return {
      item: officialItem,
      itemType: "official",
      creatorName: null,
      userId: null,
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
    return {
      item: userItem,
      itemType: "custom",
      creatorName:
        (userItem.user_profiles as { display_name: string })?.display_name ||
        null,
      userId: userItem.user_id,
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
      return {
        item: ownItem,
        itemType: "custom",
        creatorName: null,
        userId: ownItem.user_id,
      };
    }
  }

  return { item: null, itemType: "official", creatorName: null, userId: null };
}

export default async function MagicItemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { item, itemType, creatorName, userId } = await fetchMagicItem(
    supabase,
    slug,
    user?.id || null,
  );

  if (!item) {
    notFound();
  }

  const magicItem = item as MagicItem;
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
          <CardContent>
            {/* Main Info */}
            <CardHeader>
              <div className="flex gap-6">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                    {magicItem.image_url ? (
                      <Image
                        src={
                          getTransformedImageUrl(
                            magicItem.image_url,
                            "detail",
                          ) || ""
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
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-3xl">{magicItem.name}</CardTitle>
                    <SourceBadge
                      itemType={itemType}
                      creatorName={creatorName}
                      userId={userId}
                    />
                  </div>
                  {isOwner && (
                    <div className="mt-4">
                      <UserMagicItemActions itemSlug={magicItem.slug} />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {magicItem.description}
              </p>
            </CardContent>

            {/* Traits Section */}
            {magicItem.traits.length > 0 && (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Traits</CardTitle>
                </CardHeader>
                <TraitsSection
                  groupedTraits={{
                    Benefit: groupedTraits.Benefit,
                    Curse: groupedTraits.Curse,
                    Bonus: groupedTraits.Bonus,
                    Personality: groupedTraits.Personality,
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
