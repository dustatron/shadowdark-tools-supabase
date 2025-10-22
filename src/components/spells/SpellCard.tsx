"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  Book,
  Clock,
  Users,
  Ruler,
  MoreVertical,
  Eye,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

interface Spell {
  id: string;
  name: string;
  slug: string;
  description: string;
  classes: string[];
  duration: string;
  range: string;
  tier: number;
  source: string;
  author_notes?: string;
  spell_type?: "official" | "user";
  creator_id?: string;
}

interface SpellCardProps {
  spell: Spell;
  currentUserId?: string;
  favoriteId?: string | null;
  showActions?: boolean;
}

export function SpellCard({
  spell,
  currentUserId,
  favoriteId,
  showActions = true,
}: SpellCardProps) {
  const [expanded, setExpanded] = useState(false);

  const tierVariant =
    spell.tier <= 1
      ? "secondary"
      : spell.tier <= 2
        ? "default"
        : spell.tier <= 3
          ? "default"
          : spell.tier <= 4
            ? "destructive"
            : "outline";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Link href={`/spells/${spell.slug}`} className="hover:underline">
              <CardTitle className="text-lg line-clamp-1">
                {spell.name}
              </CardTitle>
            </Link>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={tierVariant}>Tier {spell.tier}</Badge>
              <Badge variant="outline">{spell.source}</Badge>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {currentUserId && (
                <FavoriteButton
                  itemId={spell.id}
                  itemType="spell"
                  initialFavoriteId={favoriteId || undefined}
                  compact={true}
                />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/spells/${spell.slug}`}
                      className="flex items-center gap-2"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">
              {spell.classes.join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">{spell.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">{spell.range}</span>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
            >
              <span>{expanded ? "Hide Description" : "Show Description"}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Book size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {spell.description}
              </p>
            </div>
            {spell.author_notes && (
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <p className="text-sm text-muted-foreground">
                  {spell.author_notes}
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
