"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DiceRoller } from "@/components/encounter-tables/DiceRoller";
import { TableEntryList } from "@/components/encounter-tables/TableEntryList";
import { MonsterDetailPanel } from "@/components/encounter-tables/MonsterDetailPanel";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import type {
  EncounterTable,
  EncounterTableEntry,
  MonsterSnapshot,
} from "@/lib/encounter-tables/types";
import { toast } from "sonner";

interface PublicEncounterTableClientProps {
  table: EncounterTable;
  entries: EncounterTableEntry[];
  isAuthenticated: boolean;
  isOwner: boolean;
}

export function PublicEncounterTableClient({
  table,
  entries,
  isAuthenticated,
  isOwner,
}: PublicEncounterTableClientProps) {
  const router = useRouter();
  const [highlightedRoll, setHighlightedRoll] = useState<number | null>(null);
  const [selectedMonster, setSelectedMonster] =
    useState<MonsterSnapshot | null>(null);
  const [copying, setCopying] = useState(false);

  const handleRoll = async (result: number) => {
    setHighlightedRoll(result);
    const entry = entries.find((e) => e.roll_number === result);
    if (entry) {
      setSelectedMonster(entry.monster_snapshot);
    }
  };

  const handleCopyTable = async () => {
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please sign in to copy this table to your collection",
      });
      router.push(
        `/auth/login?redirect=/encounter-tables/public/${table.public_slug}`,
      );
      return;
    }

    setCopying(true);
    try {
      const response = await fetch(
        `/api/encounter-tables/public/${table.public_slug}/copy`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to copy table");
      }

      const copiedTable = await response.json();

      toast.success("Success", {
        description: "Table copied to your collection",
      });

      router.push(`/encounter-tables/${copiedTable.id}`);
    } catch (error) {
      console.error("Error copying table:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to copy table",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleViewOwn = () => {
    router.push(`/encounter-tables/${table.id}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{table.name}</h1>
              <Badge variant="outline">Public</Badge>
            </div>
            {table.description && (
              <p className="text-muted-foreground mt-2">{table.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>Die Size: d{table.die_size}</span>
              <span>•</span>
              <span>{entries.length} entries</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner ? (
              <Button onClick={handleViewOwn} variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                View My Table
              </Button>
            ) : (
              <Button onClick={handleCopyTable} disabled={copying}>
                {copying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to My Tables
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dice Roller */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Roll Encounter</CardTitle>
          <CardDescription>
            Roll the dice to randomly select a monster from this table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiceRoller dieSize={table.die_size} onRoll={handleRoll} />
        </CardContent>
      </Card>

      {/* Table Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Encounter Table Entries</CardTitle>
          <CardDescription>
            All monsters in this encounter table (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableEntryList
            entries={entries}
            highlightedRoll={highlightedRoll ?? undefined}
            onEntryClick={(entry) => setSelectedMonster(entry.monster_snapshot)}
          />
        </CardContent>
      </Card>

      {/* Monster Detail Panel */}
      <MonsterDetailPanel
        monster={selectedMonster}
        open={!!selectedMonster}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMonster(null);
            setHighlightedRoll(null);
          }
        }}
      />
    </div>
  );
}
