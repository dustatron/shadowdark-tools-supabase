"use client";

import { EmptyState } from "@/src/components/ui/EmptyState";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/src/components/ui/ErrorAlert";
import { Pagination } from "@/src/components/ui/Pagination";
import { Search } from "lucide-react";
import { EquipmentItem, PaginationState } from "@/lib/types/equipment";
import { EquipmentCard } from "./EquipmentCard";
import { EquipmentTable } from "./EquipmentTable";
import { ViewMode } from "@/lib/types/monsters";

interface EquipmentListProps {
  equipment: EquipmentItem[];
  pagination?: PaginationState & { total: number; totalPages: number };
  loading?: boolean;
  error?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRetry?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  view?: ViewMode;
}

export function EquipmentList({
  equipment,
  pagination,
  loading = false,
  error,
  onPageChange,
  onPageSizeChange,
  onRetry,
  emptyStateTitle = "No equipment found",
  emptyStateDescription = "Try adjusting your search filters.",
  view = "cards",
}: EquipmentListProps) {
  if (loading) {
    return <LoadingSpinner message="Loading equipment..." />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Failed to load equipment"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (equipment.length === 0) {
    return (
      <EmptyState
        icon={<Search size={48} />}
        title={emptyStateTitle}
        description={emptyStateDescription}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {view === "table" ? (
        <EquipmentTable equipment={equipment} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment?.map((item) => (
            <EquipmentCard key={item.id} item={item} />
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
