import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { Button } from "@/components/primitives/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserEquipment } from "@/lib/types/equipment";

export const metadata = {
  title: "Edit Equipment | Dungeon Exchange",
  description: "Edit your custom equipment",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEquipmentPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/equipment/${id}/edit`);
  }

  // Fetch the equipment item by id for this user
  const { data: item, error } = await supabase
    .from("user_equipment")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .single();

  if (error || !item) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/equipment/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Equipment
        </Link>
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Equipment</h1>
          <p className="text-muted-foreground mt-1">
            Update your equipment details
          </p>
        </div>

        <EquipmentForm
          mode="edit"
          initialData={item as UserEquipment}
          userId={user.id}
        />
      </div>
    </div>
  );
}
