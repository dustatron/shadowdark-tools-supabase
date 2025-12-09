"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Sword, Wand2, Shield, User, Crown } from "lucide-react";
import type { SearchResult } from "@/lib/types/search";

interface SearchResultCardProps {
  result: SearchResult;
}

const typeConfig = {
  monster: {
    icon: Sword,
    label: "Monster",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  magic_item: {
    icon: Wand2,
    label: "Magic Item",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  equipment: {
    icon: Shield,
    label: "Equipment",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const config = typeConfig[result.type];
  const Icon = config.icon;

  return (
    <Link href={result.detailUrl} className="block no-underline">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base truncate">
                  {result.name}
                </h3>
                <Badge variant="secondary" className={config.color}>
                  {config.label}
                </Badge>
                {result.source === "official" ? (
                  <Badge variant="outline" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    User
                  </Badge>
                )}
              </div>
              {result.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {result.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
