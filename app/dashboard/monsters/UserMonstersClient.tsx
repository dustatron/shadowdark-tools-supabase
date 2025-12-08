"use client";

import { MonsterCard } from "@/src/components/monsters/MonsterCard";
import { MonsterTable } from "@/src/components/monsters/MonsterTable";
import { useViewMode } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2, Plus } from "lucide-react";
import Link from "next/link";

interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{
    name: string;
    type: "melee" | "ranged";
    damage: string;
    range: string;
    description?: string;
  }>;
  abilities: Array<{
    name: string;
    description: string;
  }>;
  tags: {
    type: string[];
    location: string[];
  };
  source: string;
  author_notes?: string;
  monster_type?: "official" | "user";
  creator_id?: string;
}

interface UserMonstersClientProps {
  monsters: Monster[];
  currentUserId: string;
}

export function UserMonstersClient({
  monsters,
  currentUserId,
}: UserMonstersClientProps) {
  const { view, setView } = useViewMode();

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Toggle + Create Button */}
      <div className="flex justify-end items-center gap-2">
        <Button asChild>
          <Link href="/monsters/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Monster
          </Link>
        </Button>
        <div className="flex border rounded-md">
          <Button
            variant={view === "cards" ? "default" : "ghost"}
            size="icon"
            onClick={() => setView("cards")}
            title="Card view"
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setView("table")}
            title="Table view"
            className="rounded-l-none"
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {monsters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No custom monsters yet. Create your first monster to get started!
        </div>
      ) : view === "table" ? (
        <MonsterTable
          monsters={monsters}
          currentUserId={currentUserId}
          preserveSearchParams={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monsters.map((monster) => (
            <MonsterCard
              key={monster.id}
              monster={monster}
              currentUserId={currentUserId}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
