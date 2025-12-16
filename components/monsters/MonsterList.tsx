"use client";

import { MonsterCard } from "./MonsterCard";
import { MonsterTable } from "./MonsterTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { Pagination } from "@/components/shared/Pagination";
import { Search } from "lucide-react";
import { ViewMode, AllMonster, PaginationResponse } from "@/lib/types/monsters";

interface MonsterListProps {
  monsters: AllMonster[];
  pagination?: PaginationResponse;
  loading?: boolean;
  error?: string;
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  inListsSet?: Set<string>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onEditMonster?: (monster: AllMonster) => void;
  onDeleteMonster?: (monster: AllMonster) => void;
  onRetry?: () => void;
  onCreateMonster?: () => void;
  onFavoriteChange?: (
    monsterId: string,
    favoriteId: string | undefined,
  ) => void;
  onListChange?: (monsterId: string, inList: boolean) => void;
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
  inListsSet,
  onPageChange,
  onPageSizeChange,
  onEditMonster,
  onDeleteMonster,
  onRetry,
  onCreateMonster,
  onFavoriteChange,
  onListChange,
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
          inListsSet={inListsSet}
          preserveSearchParams={preserveSearchParams}
          onFavoriteChange={onFavoriteChange}
          onListChange={onListChange}
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
