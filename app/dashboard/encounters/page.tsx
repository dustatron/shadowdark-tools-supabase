import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getUserEncounterTables } from "@/lib/api/dashboard";
import type { EncounterTable } from "@/lib/encounter-tables/types";

export default async function EncountersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const encounters = await getUserEncounterTables(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Encounter Tables</h2>
        <Button asChild>
          <Link href="/encounter-tables/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Encounter
          </Link>
        </Button>
      </div>
      {encounters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {encounters.map((table: EncounterTable) => (
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
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No encounter tables yet. Create your first table to get started!
        </div>
      )}
    </div>
  );
}
