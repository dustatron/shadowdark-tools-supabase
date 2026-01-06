"use client";

import { MagicItemCard } from "./MagicItemCard";
import { MagicItemTable } from "./MagicItemTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { Pagination } from "@/components/shared/Pagination";
import { Sparkles } from "lucide-react";
import { ViewMode } from "@/lib/types/monsters";
import type { MagicItemWithAuthor } from "@/lib/types/magic-items";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MagicItemListProps {
  items: MagicItemWithAuthor[];
  pagination?: PaginationInfo;
  loading?: boolean;
  error?: string;
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRetry?: () => void;
  view?: ViewMode;
  onFavoriteChange?: (itemId: string, favoriteId: string | undefined) => void;
  onListChange?: (itemId: string, inList: boolean) => void;
  onDeckChange?: (itemId: string, inDeck: boolean) => void;
}

export function MagicItemList({
  items,
  pagination,
  loading = false,
  error,
  currentUserId,
  favoritesMap,
  onPageChange,
  onPageSizeChange,
  onRetry,
  view = "cards",
  onFavoriteChange,
  onListChange,
  onDeckChange,
}: MagicItemListProps) {
  if (loading) {
    return <LoadingSpinner message="Loading magic items..." />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Failed to load magic items"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={48} />}
        title="No magic items found"
        description="Try adjusting your search filters."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {view === "table" ? (
        <MagicItemTable
          items={items}
          currentUserId={currentUserId}
          favoritesMap={favoritesMap}
          onFavoriteChange={onFavoriteChange}
          onListChange={onListChange}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MagicItemCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              favoriteId={favoritesMap?.get(item.id) || null}
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
