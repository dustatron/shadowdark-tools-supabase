"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Dices,
  Settings,
  Share2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Alert, AlertDescription } from "@/components/primitives/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitives/dialog";
import { Separator } from "@/components/primitives/separator";
import type {
  EncounterTable,
  EncounterTableEntry,
  MonsterSnapshot,
} from "@/lib/encounter-tables/types";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

interface EncounterTableClientProps {
  table: EncounterTable;
  entries: EncounterTableEntry[];
  isOwner: boolean;
  userId: string;
}

export function EncounterTableClient({
  table,
  entries,
  isOwner,
  userId,
}: EncounterTableClientProps) {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] =
    useState<EncounterTableEntry | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRoll = () => {
    if (entries.length === 0) {
      return;
    }

    setIsRolling(true);

    // Simulate dice rolling animation
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const randomRoll = Math.floor(Math.random() * table.die_size) + 1;
      setLastRoll(randomRoll);
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        // Final roll
        const finalRoll = Math.floor(Math.random() * table.die_size) + 1;
        setLastRoll(finalRoll);

        // Find the entry for this roll
        const entry = entries.find((e) => e.roll_number === finalRoll);
        if (entry) {
          setSelectedEntry(entry);
        }

        setIsRolling(false);
      }
    }, 100);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/encounter-tables/${table.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete table");
      }

      router.push("/encounter-tables");
    } catch (error) {
      logger.error("Error deleting table:", error);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleShare = async () => {
    try {
      const newIsPublic = !table.is_public;
      const response = await fetch(`/api/encounter-tables/${table.id}/share`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_public: newIsPublic }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing settings");
      }

      router.refresh();
    } catch (error) {
      logger.error("Error updating sharing settings:", error);
    }
  };

  const renderMonsterDetails = (monster: MonsterSnapshot) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Challenge Level</div>

            <div className="text-lg font-semibold">
              {monster.challenge_level}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Armor Class</div>
            <div className="text-lg font-semibold">{monster.armor_class}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Hit Points</div>
            <div className="text-lg font-semibold">
              {monster.hit_points} ({monster.hit_dice})
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Speed</div>
          <div className="text-lg font-semibold">{monster.speed}</div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-2">Modifiers</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">STR</div>
              <div className="text-2xl font-bold">
                {monster.str_mod >= 0 ? "+" : ""}
                {monster.str_mod}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">DEX</div>
              <div className="text-2xl font-bold">
                {monster.dex_mod >= 0 ? "+" : ""}
                {monster.dex_mod}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">CON</div>
              <div className="text-2xl font-bold">
                {monster.con_mod >= 0 ? "+" : ""}
                {monster.con_mod}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">INT</div>
              <div className="text-2xl font-bold">
                {monster.int_mod >= 0 ? "+" : ""}
                {monster.int_mod}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">WIS</div>
              <div className="text-2xl font-bold">
                {monster.wis_mod >= 0 ? "+" : ""}
                {monster.wis_mod}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">CHA</div>
              <div className="text-2xl font-bold">
                {monster.cha_mod >= 0 ? "+" : ""}
                {monster.cha_mod}
              </div>
            </div>
          </div>
        </div>

        {monster.attacks.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Attacks</h4>
              <div className="space-y-2">
                {monster.attacks.map((attack, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{attack.name}</span>{" "}
                    <Badge variant="outline" className="ml-2">
                      +{attack.bonus}
                    </Badge>{" "}
                    {attack.damage} {attack.damage_type}
                    {attack.range && ` (${attack.range})`}
                    {attack.description && (
                      <p className="text-muted-foreground mt-1">
                        {attack.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {monster.abilities.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Abilities</h4>
              <div className="space-y-2">
                {monster.abilities.map((ability, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{ability.name}</span>
                    {ability.usage && (
                      <Badge variant="secondary" className="ml-2">
                        {ability.usage}
                      </Badge>
                    )}
                    <p className="text-muted-foreground mt-1">
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {monster.description && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {monster.description}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/encounter-tables">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tables
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {table.name}
              </h1>
              <Badge variant={table.is_public ? "default" : "secondary"}>
                {table.is_public ? "Public" : "Private"}
              </Badge>
            </div>
            {table.description && (
              <p className="text-muted-foreground">{table.description}</p>
            )}
            <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
              <span>d{table.die_size}</span>
              <span>•</span>
              <span>
                Levels {table.filters.level_min}-{table.filters.level_max}
              </span>
              <span>•</span>
              <span>{entries.length} entries</span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                {table.is_public ? "Make Private" : "Make Public"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/encounter-tables/${table.id}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Encounter Table?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      the encounter table and all its entries.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dice Roller</CardTitle>
              <CardDescription>
                Roll d{table.die_size} to get a random encounter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl font-bold text-primary">
                  {lastRoll
                    ? `d${table.die_size}: ${lastRoll}`
                    : `d${table.die_size}`}
                </div>
                <Button
                  size="lg"
                  onClick={handleRoll}
                  disabled={isRolling || entries.length === 0}
                >
                  <Dices className="mr-2 h-5 w-5" />
                  {isRolling ? "Rolling..." : "Roll Dice"}
                </Button>
                {entries.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      No entries in this table yet. Please regenerate the table.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Encounter Table</CardTitle>
              <CardDescription>
                All possible encounters on this table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-sm border dark:border-neutral-600 overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Roll</TableHead>
                      <TableHead>Monster</TableHead>
                      <TableHead className="w-24 text-right">CL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const isRolled = lastRoll === entry.roll_number;
                      const isSelected = selectedEntry?.id === entry.id;
                      const isHighlighted = isRolled || isSelected;

                      return (
                        <TableRow
                          key={entry.id}
                          className={
                            isHighlighted
                              ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground cursor-pointer"
                              : "cursor-pointer"
                          }
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <TableCell className="font-medium">
                            {entry.roll_number}
                          </TableCell>
                          <TableCell>{entry.monster_snapshot.name}</TableCell>
                          <TableCell className="text-right">
                            {entry.monster_snapshot.challenge_level}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedEntry ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{selectedEntry.monster_snapshot.name}</CardTitle>
                    <div>{selectedEntry.monster_snapshot.description}</div>
                    <CardDescription>
                      {selectedEntry.monster_snapshot.size}{" "}
                      {selectedEntry.monster_snapshot.type}
                      {selectedEntry.monster_snapshot.alignment &&
                        ` • ${selectedEntry.monster_snapshot.alignment}`}
                    </CardDescription>
                  </div>
                  {selectedEntry.monster_id && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/monsters/${selectedEntry.monster_id}`}
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderMonsterDetails(selectedEntry.monster_snapshot)}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-muted-foreground">
                  <Dices className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Roll the dice or click an entry to view monster details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
