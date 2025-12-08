"use client";

import { MagicItemCard } from "./MagicItemCard";
import { MagicItemTable } from "./MagicItemTable";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/src/components/ui/ErrorAlert";
import { Pagination } from "@/src/components/ui/Pagination";
import { Sparkles } from "lucide-react";
import { ViewMode } from "@/lib/types/monsters";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MagicItemListProps {
  items: MagicItem[];
  pagination?: PaginationInfo;
  loading?: boolean;
  error?: string;
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRetry?: () => void;
  view?: ViewMode;
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
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MagicItemCard key={item.id} item={item} />
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
