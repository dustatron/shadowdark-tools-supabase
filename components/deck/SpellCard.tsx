"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import type { SpellForDeck } from "@/lib/validations/deck";

interface SpellCardProps {
  spell: SpellForDeck;
  onRemove?: () => void;
  compact?: boolean;
}

export function SpellCard({
  spell,
  onRemove,
  compact = false,
}: SpellCardProps) {
  const tierColor = (tier: number) => {
    if (tier <= 1) return "bg-green-500/10 text-green-700 dark:text-green-400";
    if (tier <= 3) return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{spell.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`text-xs ${tierColor(spell.tier)}`}
              >
                Tier {spell.tier}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {spell.range}
              </span>
            </div>
          </div>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            aria-label={`Remove ${spell.name}`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{spell.name}</CardTitle>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label={`Remove ${spell.name}`}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={tierColor(spell.tier)}>
            Tier {spell.tier}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {spell.duration}
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{spell.range}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {spell.description}
        </p>
      </CardContent>
    </Card>
  );
}
