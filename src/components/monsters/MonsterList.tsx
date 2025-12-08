"use client";

import { MonsterCard } from "./MonsterCard";
import { MonsterTable } from "./MonsterTable";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorAlert } from "../ui/ErrorAlert";
import { Pagination } from "../ui/Pagination";
import { Search } from "lucide-react";
import { ViewMode } from "@/lib/types/monsters";

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MonsterListProps {
  monsters: Monster[];
  pagination?: PaginationInfo;
  loading?: boolean;
  error?: string;
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onEditMonster?: (monster: Monster) => void;
  onDeleteMonster?: (monster: Monster) => void;
  onRetry?: () => void;
  onCreateMonster?: () => void;
  compact?: boolean;
  preserveSearchParams?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  view?: ViewMode;
}

export function MonsterList({
  monsters,
  pagination,
  loading = false,
  error,
  currentUserId,
  favoritesMap,
  onPageChange,
  onPageSizeChange,
  onEditMonster,
  onDeleteMonster,
  onRetry,
  onCreateMonster,
  compact = false,
  preserveSearchParams = true,
  emptyStateTitle = "No monsters found",
  emptyStateDescription = "Try adjusting your search filters or create a new monster.",
  view = "cards",
}: MonsterListProps) {
  if (loading) {
    return <LoadingSpinner message="Loading monsters..." />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Failed to load monsters"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (monsters.length === 0) {
    return (
      <EmptyState
        icon={<Search size={48} />}
        title={emptyStateTitle}
        description={emptyStateDescription}
        action={
          onCreateMonster
            ? {
                label: "Create Monster",
                onClick: onCreateMonster,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {view === "table" ? (
        <MonsterTable
          monsters={monsters}
          currentUserId={currentUserId}
          favoritesMap={favoritesMap}
          preserveSearchParams={preserveSearchParams}
        />
      ) : (
        <div
          className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
        >
          {monsters?.map((monster) => (
            <MonsterCard
              key={monster.id}
              monster={monster}
              currentUserId={currentUserId}
              favoriteId={favoritesMap?.get(monster.id) || null}
              onEdit={onEditMonster}
              onDelete={onDeleteMonster}
              compact={compact}
              preserveSearchParams={preserveSearchParams}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          totalItems={pagination.total}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
