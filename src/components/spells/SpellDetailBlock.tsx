"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Ruler, Star } from "lucide-react";

interface SpellDetailBlockProps {
  tier: number;
  classes: string[];
  duration: string;
  range: string;
}

export function SpellDetailBlock({
  tier,
  classes,
  duration,
  range,
}: SpellDetailBlockProps) {
  const tierColorClass =
    tier <= 1
      ? "text-gray-500"
      : tier <= 2
        ? "text-blue-500"
        : tier <= 3
          ? "text-purple-500"
          : tier <= 4
            ? "text-red-500"
            : "text-slate-700";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tier */}
          <div className="flex items-center gap-4">
            <Star size={24} className={tierColorClass} />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Tier
              </p>
              <p className="text-2xl font-bold">{tier}</p>
            </div>
          </div>

          {/* Classes */}
          <div className="flex items-center gap-4">
            <Users size={24} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Classes
              </p>
              <p className="text-lg font-medium">{classes.join(", ")}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-4">
            <Clock size={24} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Duration
              </p>
              <p className="text-lg font-medium">{duration}</p>
            </div>
          </div>

          {/* Range */}
          <div className="flex items-center gap-4">
            <Ruler size={24} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Range
              </p>
              <p className="text-lg font-medium">{range}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
