import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicEncounterTableClient } from "./PublicEncounterTableClient";
import type {
  EncounterTable,
  EncounterTableEntry,
} from "@/lib/encounter-tables/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicEncounterTablePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Check authentication (optional for this page)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the public encounter table
  const { data: table, error: tableError } = await supabase
    .from("encounter_tables")
    .select(
      `
      id,
      user_id,
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
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (tableError || !table) {
    console.error("Error fetching public encounter table:", tableError);
    notFound();
  }

  // Fetch the table entries
  const { data: entries, error: entriesError } = await supabase
    .from("encounter_table_entries")
    .select(
      `
      id,
      table_id,
      roll_number,
      monster_id,
      monster_snapshot,
      created_at,
      updated_at
    `,
    )
    .eq("table_id", table.id)
    .order("roll_number", { ascending: true });

  if (entriesError) {
    console.error("Error fetching table entries:", entriesError);
  }

  const encounterTable = table as unknown as EncounterTable;
  const tableEntries = (entries as unknown as EncounterTableEntry[]) || [];

  // Check if current user is the owner
  const isOwner = user?.id === table.user_id;

  return (
    <PublicEncounterTableClient
      table={encounterTable}
      entries={tableEntries}
      isAuthenticated={!!user}
      isOwner={isOwner}
    />
  );
}
