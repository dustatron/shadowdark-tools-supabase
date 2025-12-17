"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  EquipmentItem,
  FilterValues,
  PaginationState,
  serializeFiltersToSearchParams,
} from "@/lib/types/equipment";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { useViewMode } from "@/lib/hooks";
import { logger } from "@/lib/utils/logger";

interface EquipmentClientProps {
  initialFilters: FilterValues;
  initialPagination: PaginationState;
  currentUserId?: string;
}

export function EquipmentClient({
  initialFilters,
  initialPagination,
  currentUserId,
}: EquipmentClientProps) {
  const router = useRouter();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const { view, setView } = useViewMode();
  const [pagination, setPagination] = useState({
    ...initialPagination,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEquipment();
  }, [filters, pagination.page, pagination.limit]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (pagination.page - 1) * pagination.limit;

      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.search) {
        params.append("q", filters.search);
      }

      if (filters.itemType.length > 0) {
        params.append("itemType", filters.itemType.join(","));
      }

      const response = await fetch(`/api/equipment?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch equipment");
      }

      const result = await response.json();

      // Parse JSONB fields (cost and properties)
      const parsedEquipment = (result.data || []).map((item: any) => ({
        ...item,
        cost: typeof item.cost === "string" ? JSON.parse(item.cost) : item.cost,
        properties: item.properties || [],
      }));

      setEquipment(parsedEquipment);

      const total = result.pagination?.totalCount || 0;
      const totalPages = Math.ceil(total / pagination.limit);

      setPagination((prev) => ({
        ...prev,
        total,
        totalPages,
      }));
    } catch (err) {
      logger.error("Error fetching equipment:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (
    newFilters: FilterValues,
    newPagination: { page: number; limit: number },
  ) => {
    const params = serializeFiltersToSearchParams(newFilters, newPagination);
    const queryString = params.toString();

    router.push(queryString ? `/equipment?${queryString}` : "/equipment", {
      scroll: false,
    });
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const newPagination = { ...pagination, page: 1 };
    setPagination((prev) => ({ ...prev, page: 1 }));

    updateURL(newFilters, newPagination);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));

    updateURL(filters, { page, limit: pagination.limit });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));

    updateURL(filters, { page: 1, limit: pageSize });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ViewModeToggle view={view} onViewChange={setView} />
      </div>

      <div className="mb-4">
        <EquipmentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />
      </div>

      <EquipmentList
        equipment={equipment}
        pagination={pagination}
        loading={loading}
        error={error || undefined}
        currentUserId={currentUserId}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={fetchEquipment}
        view={view}
      />
    </div>
  );
}
