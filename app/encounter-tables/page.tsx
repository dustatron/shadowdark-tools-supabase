import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EncounterTable } from "@/lib/encounter-tables/types";

export const metadata = {
  title: "Random Encounter Tables",
  description: "Manage your random encounter tables for Shadowdark",
};

export default async function EncounterTablesPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login?redirect=/encounter-tables");
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Random Encounter Tables
          </h1>
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

      {encounterTables.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold">
                  No encounter tables yet
                </h3>
                <p className="text-sm max-w-md mx-auto mt-2">
                  Get started by creating your first random encounter table.
                  Choose a die size, set your filters, and generate a table
                  instantly.
                </p>
              </div>
              <Button asChild>
                <Link href="/encounter-tables/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Table
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {encounterTables.map((table) => (
            <Link
              key={table.id}
              href={`/encounter-tables/${table.id}`}
              className="block transition-all hover:scale-105"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{table.name}</CardTitle>
                    <Badge variant={table.is_public ? "default" : "secondary"}>
                      {table.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  {table.description && (
                    <CardDescription className="line-clamp-2">
                      {table.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Die Size:</span>
                      <Badge variant="outline">d{table.die_size}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Levels:</span>
                      <span className="font-medium">
                        {table.filters.level_min} - {table.filters.level_max}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sources:</span>
                      <span className="font-medium">
                        {table.filters.sources.length}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created {new Date(table.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
