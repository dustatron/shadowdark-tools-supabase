"use client";

import { MonsterCard } from "@/components/monsters/MonsterCard";
import { MonsterTable } from "@/components/monsters/MonsterTable";
import { useViewMode } from "@/lib/hooks";
import { Button } from "@/components/primitives/button";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AllMonster } from "@/lib/types/monsters";

interface UserMonstersClientProps {
  monsters: AllMonster[];
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
        <ViewModeToggle view={view} onViewChange={setView} />
        <Button asChild>
          <Link href="/monsters/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Monster
          </Link>
        </Button>
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
