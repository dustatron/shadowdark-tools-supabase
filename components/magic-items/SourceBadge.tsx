"use client";

import { Badge } from "@/components/ui/badge";
import type { SourceBadgeProps } from "@/lib/types/magic-items";

export function SourceBadge({ itemType, creatorName }: SourceBadgeProps) {
  if (itemType === "official") {
    return (
      <Badge variant="secondary" className="text-xs">
        Core Rules
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs">
      {creatorName || "Community"}
    </Badge>
  );
}
