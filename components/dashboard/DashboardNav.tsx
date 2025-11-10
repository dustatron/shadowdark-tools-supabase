"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Sparkles, Dice6, Heart, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 p-4">
      <div className="flex justify-between items-center pb-2 mb-4 border-b-2">
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Link
        href="/dashboard/decks"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname?.startsWith("/dashboard/decks")
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Layers className="h-4 w-4" />
        Deck Builder
      </Link>

      <Link
        href="/dashboard/monsters"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/dashboard/monsters"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Swords className="h-4 w-4" />
        Monsters
      </Link>

      <Link
        href="/dashboard/spells"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/dashboard/spells"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Sparkles className="h-4 w-4" />
        Spells
      </Link>

      <Link
        href="/dashboard/encounters"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/dashboard/encounters"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Dice6 className="h-4 w-4" />
        Encounters
      </Link>

      <Link
        href="/dashboard/favorites/monsters"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/dashboard/favorites/monsters"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Heart className="h-4 w-4" />
        Fav Monsters
      </Link>

      <Link
        href="/dashboard/favorites/spells"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/dashboard/favorites/spells"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Heart className="h-4 w-4" />
        Fav Spells
      </Link>
    </nav>
  );
}
