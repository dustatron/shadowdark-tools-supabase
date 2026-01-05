"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
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

// Parse filters from URL search params
function parseFiltersFromSearchParams(params: URLSearchParams): FilterValues {
  const search = params.get("q") || "";
  const itemType = params.get("itemType")?.split(",").filter(Boolean) || [];

  return {
    search,
    itemType,
  };
}

interface FetchEquipmentParams {
  filters: FilterValues;
  page: number;
  limit: number;
}

interface FetchEquipmentResponse {
  data: EquipmentItem[];
  pagination: {
    totalCount: number;
  };
}

async function fetchEquipment({
  filters,
  page,
  limit,
}: FetchEquipmentParams): Promise<FetchEquipmentResponse> {
  const offset = (page - 1) * limit;

  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
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
  const parsedEquipment = (result.data || []).map((item: EquipmentItem) => ({
    ...item,
    cost: typeof item.cost === "string" ? JSON.parse(item.cost) : item.cost,
    properties: item.properties || [],
  }));

  return {
    data: parsedEquipment,
    pagination: result.pagination || { totalCount: 0 },
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

  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const currentUserId = user?.id;
  const { view, setView } = useViewMode();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["equipment", { filters, page, limit }],
    queryFn: () => fetchEquipment({ filters, page, limit }),
  });

  const equipment = data?.data ?? [];
  const total = data?.pagination?.totalCount ?? 0;
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    page,
    limit,
    total,
    totalPages,
  };

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
      setPage(1);
      updateURL(newFilters, { page: 1, limit });
    },
    [limit, updateURL],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateURL(filters, { page: newPage, limit });
    },
    [filters, limit, updateURL],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setLimit(pageSize);
      setPage(1);
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
          {user && (
            <Button asChild>
              <Link href="/equipment/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Equipment
              </Link>
            </Button>
          )}
          <ViewModeToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="mb-4">
        <EquipmentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
        />
      </div>

      <EquipmentList
        equipment={equipment}
        pagination={pagination}
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        currentUserId={currentUserId}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRetry={() => refetch()}
        view={view}
      />
    </div>
  );
}
