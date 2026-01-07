import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MagicItemForm } from "@/components/magic-items/MagicItemForm";
import { Button } from "@/components/primitives/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserMagicItem } from "@/lib/types/magic-items";

export const metadata = {
  title: "Edit Magic Item | Dungeon Exchange",
  description: "Edit your custom magic item",
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditMagicItemPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/magic-items/${slug}/edit`);
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;

  // Try to find the item - check multiple sources based on permissions
  let item: UserMagicItem | null = null;
  let isOfficial = false;

  // First, try user's own items
  const { data: userItem } = await supabase
    .from("user_magic_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .single();

  if (userItem) {
    item = userItem as UserMagicItem;
    isOfficial = false;
  } else if (isAdmin) {
    // Admin can edit any user's item
    const { data: anyUserItem } = await supabase
      .from("user_magic_items")
      .select("*")
      .eq("slug", slug)
      .single();

    if (anyUserItem) {
      item = anyUserItem as UserMagicItem;
      isOfficial = false;
    } else {
      // Admin can also edit official items
      const { data: officialItem } = await supabase
        .from("official_magic_items")
        .select("*")
        .eq("slug", slug)
        .single();

      if (officialItem) {
        // Convert official item to UserMagicItem-like structure for form
        item = {
          ...officialItem,
          user_id: null,
          is_public: true,
          image_url: null,
          is_ai_generated: false,
        } as unknown as UserMagicItem;
        isOfficial = true;
      }
    }
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/magic-items/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Item
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isOfficial ? "Edit Official Magic Item" : "Edit Magic Item"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isOfficial
              ? "You are editing official Shadowdark content"
              : "Update your magic item details"}
          </p>
        </div>

        <MagicItemForm
          mode="edit"
          initialData={item}
          userId={user.id}
          isOfficial={isOfficial}
        />
      </div>
    </div>
  );
}
