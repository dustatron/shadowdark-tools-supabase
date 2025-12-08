"use client";

import { SpellCard } from "@/src/components/spells/SpellCard";
import { SpellTable } from "@/src/components/spells/SpellTable";
import { useViewMode } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { ViewModeToggle } from "@/src/components/ui/ViewModeToggle";
import { Plus } from "lucide-react";
import Link from "next/link";

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

interface UserSpellsClientProps {
  spells: Spell[];
  currentUserId: string;
}

export function UserSpellsClient({
  spells,
  currentUserId,
}: UserSpellsClientProps) {
  const { view, setView } = useViewMode();

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Toggle + Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Spells</h2>
        <div className="flex items-center gap-2">
          <ViewModeToggle view={view} onViewChange={setView} />
          <Button asChild>
            <Link href="/spells/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Spell
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      {spells.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No custom spells yet. Create your first spell to get started!
        </div>
      ) : view === "table" ? (
        <SpellTable spells={spells} currentUserId={currentUserId} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              currentUserId={currentUserId}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
