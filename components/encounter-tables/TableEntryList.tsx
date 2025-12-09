"use client";

import { Card, CardContent } from "@/components/primitives/card";
import { Button } from "@/components/primitives/button";
import { Badge } from "@/components/primitives/badge";
import { Edit2, Skull } from "lucide-react";
import { EncounterTableEntry } from "@/lib/encounter-tables/types";
import { cn } from "@/lib/utils";

interface TableEntryListProps {
  entries: EncounterTableEntry[];
  highlightedRoll?: number;
  onEntryClick?: (entry: EncounterTableEntry) => void;
  onEditEntry?: (entry: EncounterTableEntry) => void;
  className?: string;
}

export function TableEntryList({
  entries,
  highlightedRoll,
  onEntryClick,
  onEditEntry,
  className,
}: TableEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Skull className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No entries in this table yet.</p>
      </div>
    );
  }

  const canEdit = !!onEditEntry;

  return (
    <div className={cn("space-y-3", className)}>
      {entries.map((entry) => {
        const isHighlighted = highlightedRoll === entry.roll_number;
        const monster = entry.monster_snapshot;

        return (
          <Card
            key={entry.id}
            className={cn(
              "transition-all hover:shadow-md cursor-pointer",
              isHighlighted && "ring-2 ring-primary shadow-lg",
            )}
            onClick={() => onEntryClick?.(entry)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Roll number and Monster info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Roll number badge */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                      isHighlighted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {entry.roll_number}
                  </div>

                  {/* Monster details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Monster name */}
                    <h3 className="font-semibold text-lg truncate">
                      {monster.name}
                    </h3>

                    {/* Monster stats */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        CL {monster.challenge_level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        AC {monster.armor_class}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        HP {monster.hit_points}
                      </span>
                      {monster.size && (
                        <span className="text-sm text-muted-foreground">
                          {monster.size}
                        </span>
                      )}
                      {monster.type && (
                        <span className="text-sm text-muted-foreground">
                          {monster.type}
                        </span>
                      )}
                    </div>

                    {/* Monster description (truncated on mobile) */}
                    {monster.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                        {monster.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side - Edit button (owner only) */}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEntry(entry);
                    }}
                    aria-label={`Edit entry ${entry.roll_number}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
