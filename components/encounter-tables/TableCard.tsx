"use client";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdown-menu";
import type { EncounterTable } from "@/lib/encounter-tables/types";
import {
  Eye,
  Pencil,
  Trash2,
  Share2,
  Globe,
  Lock,
  MoreVertical,
  Dices,
} from "lucide-react";

interface TableCardProps {
  table: EncounterTable;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onRoll?: () => void;
  isLoading?: boolean;
}

export function TableCard({
  table,
  onView,
  onEdit,
  onDelete,
  onShare,
  onRoll,
  isLoading = false,
}: TableCardProps) {
  const entryCount = table.entries?.length || 0;
  const isComplete = entryCount === table.die_size;

  // Format die size for display (standard dice get "d" prefix)
  const getDieSizeDisplay = (size: number): string => {
    const standardSizes = [4, 6, 8, 10, 12, 20, 100];
    if (standardSizes.includes(size)) {
      return `d${size}`;
    }
    return `d${size} (custom)`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="truncate">{table.name}</CardTitle>
              {table.is_public ? (
                <Badge variant="secondary" className="shrink-0">
                  <Globe className="w-3 h-3 mr-1" aria-hidden="true" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="shrink-0">
                  <Lock className="w-3 h-3 mr-1" aria-hidden="true" />
                  Private
                </Badge>
              )}
            </div>
            {table.description && (
              <CardDescription className="line-clamp-2">
                {table.description}
              </CardDescription>
            )}
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                disabled={isLoading}
                aria-label="Table actions"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onShare && (
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {table.is_public ? "Make Private" : "Share Public"}
                </DropdownMenuItem>
              )}
              {(onDelete || onShare) && (onView || onEdit) && (
                <DropdownMenuSeparator />
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Die Size Badge */}
          <Badge variant="outline" className="font-mono">
            <Dices className="w-3 h-3 mr-1" aria-hidden="true" />
            {getDieSizeDisplay(table.die_size)}
          </Badge>

          {/* Entry Count Badge */}
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {entryCount}/{table.die_size} entries
            {isComplete && " ✓"}
          </Badge>

          {/* Filter Badges */}
          {table.filters.sources && table.filters.sources.length > 0 && (
            <Badge variant="outline">
              {table.filters.sources.length} source
              {table.filters.sources.length !== 1 ? "s" : ""}
            </Badge>
          )}

          {table.filters.level_min !== undefined &&
            table.filters.level_max !== undefined && (
              <Badge variant="outline">
                CL {table.filters.level_min}-{table.filters.level_max}
              </Badge>
            )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            disabled={isLoading}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        )}
        {onRoll && (
          <Button
            variant="default"
            size="sm"
            onClick={onRoll}
            disabled={isLoading || !isComplete}
            className="flex-1"
            aria-label={`Roll ${getDieSizeDisplay(table.die_size)}`}
          >
            <Dices className="w-4 h-4 mr-2" />
            Roll {getDieSizeDisplay(table.die_size)}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
