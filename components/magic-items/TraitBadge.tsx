"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TraitBadgeProps {
  trait: {
    name: string;
    description: string;
  };
}

const variantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Benefit: "default", // Blue
  Curse: "destructive", // Red
  Bonus: "secondary", // Purple
  Personality: "outline", // Neutral
};

export function TraitBadge({ trait }: TraitBadgeProps) {
  const variant = variantMap[trait.name] || "outline";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={variant} className="cursor-help whitespace-nowrap">
          {trait.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <p className="text-sm">{trait.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
