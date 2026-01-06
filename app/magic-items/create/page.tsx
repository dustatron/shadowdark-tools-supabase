import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MagicItemForm } from "@/components/magic-items/MagicItemForm";
import { Button } from "@/components/primitives/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Create Magic Item | Dungeon Exchange",
  description: "Create a custom magic item for your Shadowdark campaigns",
};

export default async function CreateMagicItemPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/magic-items/create");
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/magic-items">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Magic Items
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Magic Item</h1>
          <p className="text-muted-foreground mt-1">
            Create a custom magic item for your Shadowdark campaigns
          </p>
        </div>

        <MagicItemForm mode="create" userId={user.id} />
      </div>
    </div>
  );
}
