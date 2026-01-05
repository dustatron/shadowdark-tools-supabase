import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { Button } from "@/components/primitives/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Create Equipment | Dungeon Exchange",
  description: "Create custom equipment for your Shadowdark campaigns",
};

export default async function CreateEquipmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/equipment/create");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/equipment">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Equipment
        </Link>
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Equipment</h1>
          <p className="text-muted-foreground mt-1">
            Create custom equipment for your Shadowdark campaigns
          </p>
        </div>

        <EquipmentForm mode="create" userId={user.id} />
      </div>
    </div>
  );
}
