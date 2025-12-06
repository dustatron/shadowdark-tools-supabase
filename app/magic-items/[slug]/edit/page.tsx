import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MagicItemForm } from "@/components/magic-items/MagicItemForm";
import { Button } from "@/components/ui/button";
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

  // Fetch the magic item by slug for this user
  const { data: item, error } = await supabase
    .from("user_magic_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .single();

  if (error || !item) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/magic-items/${slug}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Item
        </Link>
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Magic Item</h1>
          <p className="text-muted-foreground mt-1">
            Update your magic item details
          </p>
        </div>

        <MagicItemForm mode="edit" initialData={item as UserMagicItem} />
      </div>
    </div>
  );
}
