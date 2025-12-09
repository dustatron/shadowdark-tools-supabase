import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import type { EncounterTable } from "@/lib/encounter-tables/types";
import { EncounterTablesView } from "@/components/encounters/EncounterTablesView";

export const metadata = {
  title: "Random Encounter Tables",
  description: "Manage your random encounter tables for Shadowdark",
};

export default async function EncounterTablesPage() {
  const supabase = await createClient();

  // Check authentication - redirect to generator if not logged in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/encounter-tables/new");
  }

  // Fetch user's encounter tables
  const { data: tables, error } = await supabase
    .from("encounter_tables")
    .select(
      `
      id,
      name,
      description,
      die_size,
      is_public,
      public_slug,
      filters,
      created_at,
      updated_at
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching encounter tables:", error);
  }

  const encounterTables = (tables as unknown as EncounterTable[]) || [];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-muted-foreground mt-2">
            Generate and manage random encounter tables for your Shadowdark
            games
          </p>
        </div>
        <Button asChild>
          <Link href="/encounter-tables/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Table
          </Link>
        </Button>
      </div>

      <EncounterTablesView tables={encounterTables} />
    </div>
  );
}
