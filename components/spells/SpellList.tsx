"use client";

import { SpellCard } from "./SpellCard";
import { SpellTable } from "./SpellTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { Pagination } from "@/components/shared/Pagination";
import { Book } from "lucide-react";
import { ViewMode } from "@/lib/types/monsters";
import type { AllSpell, SpellWithAuthor } from "@/lib/types/spells";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SpellListProps {
  spells: AllSpell[];
  pagination?: PaginationInfo;
  loading?: boolean;
  error?: string;
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  inListsSet?: Set<string>;
  inDecksSet?: Set<string>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRetry?: () => void;
  onFavoriteChange?: (spellId: string, favoriteId: string | undefined) => void;
  onListChange?: (spellId: string, inList: boolean) => void;
  onDeckChange?: (spellId: string, inDeck: boolean) => void;
  view?: ViewMode;
}

export function SpellList({
  spells,
  pagination,
  loading = false,
  error,
  currentUserId,
  favoritesMap,
  inListsSet,
  inDecksSet,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onFavoriteChange,
  onListChange,
  onDeckChange,
  view = "cards",
}: SpellListProps) {
  if (loading) {
    return <LoadingSpinner message="Loading spells..." />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Failed to load spells"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (spells.length === 0) {
    return (
      <EmptyState
        icon={<Book size={48} />}
        title="No spells found"
        description="Try adjusting your search filters."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {view === "table" ? (
        <SpellTable
          spells={spells}
          currentUserId={currentUserId}
          favoritesMap={favoritesMap}
          inListsSet={inListsSet}
          inDecksSet={inDecksSet}
          onFavoriteChange={onFavoriteChange}
          onListChange={onListChange}
          onDeckChange={onDeckChange}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell as SpellWithAuthor}
              currentUserId={currentUserId}
              favoriteId={favoritesMap?.get(spell.id) || null}
              onFavoriteChange={onFavoriteChange}
              onListChange={onListChange}
              onDeckChange={onDeckChange}
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
