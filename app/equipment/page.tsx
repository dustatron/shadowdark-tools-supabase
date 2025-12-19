"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EquipmentItem,
  FilterValues,
  serializeFiltersToSearchParams,
} from "@/lib/types/equipment";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { useViewMode } from "@/lib/hooks";
import { useAuth } from "@/components/providers/AuthProvider";
import { logger } from "@/lib/utils/logger";

// Parse filters from URL search params
function parseFiltersFromSearchParams(params: URLSearchParams): FilterValues {
  const search = params.get("q") || "";
  const itemType = params.get("itemType")?.split(",").filter(Boolean) || [];

  return {
    search,
    itemType,
  };
}

export default function EquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Parse initial values from URL
  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "20", 10);

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const currentUserId = user?.id;
  const { view, setView } = useViewMode();
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const fetchEquipment = useCallback(async () => {
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
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const updateURL = useCallback(
    (
      newFilters: FilterValues,
      newPagination: { page: number; limit: number },
    ) => {
      const params = serializeFiltersToSearchParams(newFilters, newPagination);
      const queryString = params.toString();

      router.push(queryString ? `/equipment?${queryString}` : "/equipment", {
        scroll: false,
      });
    },
    [router],
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      const newPagination = { ...pagination, page: 1 };
      setPagination((prev) => ({ ...prev, page: 1 }));

      updateURL(newFilters, newPagination);
    },
    [pagination, updateURL],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));

      updateURL(filters, { page, limit: pagination.limit });
    },
    [filters, pagination.limit, updateURL],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setPagination((prev) => ({ ...prev, limit: pageSize, page: 1 }));

      updateURL(filters, { page: 1, limit: pageSize });
    },
    [filters, updateURL],
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Equipment</h1>
          <p className="text-muted-foreground mt-1">
            Browse weapons, armor, and gear
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle view={view} onViewChange={setView} />
        </div>
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
