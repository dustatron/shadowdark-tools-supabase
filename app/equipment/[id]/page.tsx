import { createClient } from "@/lib/supabase/server";
import { EquipmentDetailClient } from "./EquipmentDetailClient"; // Will create this
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/primitives/button";
import { Alert, AlertDescription } from "@/components/primitives/alert";
import { generateBackUrl } from "@/lib/utils";

export default async function EquipmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: equipmentId } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const backUrl = generateBackUrl(resolvedSearchParams, "/equipment");

  const { data: equipment, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", equipmentId)
    .single();

  if (error || !equipment) {
    return (
      <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href={backUrl} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Equipment
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Equipment not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Parse JSONB fields
  const parsedEquipment = {
    ...equipment,
    cost:
      typeof equipment.cost === "string"
        ? JSON.parse(equipment.cost)
        : equipment.cost,
    properties: equipment.properties || [],
  };

  return (
    <EquipmentDetailClient
      equipment={parsedEquipment}
      currentUserId={user?.id}
    />
  );
}
