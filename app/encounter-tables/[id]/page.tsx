import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EncounterTableClient } from "./EncounterTableClient";
import type {
  EncounterTable,
  EncounterTableEntry,
} from "@/lib/encounter-tables/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EncounterTablePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/auth/login?redirect=/encounter-tables/${id}`);
  }

  // Fetch the encounter table
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
    .eq("id", id)
    .single();

  if (tableError || !table) {
    console.error("Error fetching encounter table:", tableError);
    notFound();
  }

  // Check if user has access to this table
  const isOwner = table.user_id === user.id;
  const isPublic = table.is_public;

  if (!isOwner && !isPublic) {
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
    .eq("table_id", id)
    .order("roll_number", { ascending: true });

  if (entriesError) {
    console.error("Error fetching table entries:", entriesError);
  }

  const encounterTable = table as unknown as EncounterTable;
  const tableEntries = (entries as unknown as EncounterTableEntry[]) || [];

  return (
    <EncounterTableClient
      table={encounterTable}
      entries={tableEntries}
      isOwner={isOwner}
      userId={user.id}
    />
  );
}
