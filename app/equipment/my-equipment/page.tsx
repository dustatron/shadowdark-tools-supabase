"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { Button } from "@/components/primitives/button";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import type { UserEquipment } from "@/lib/types/equipment";

interface FetchResponse {
  data: UserEquipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchUserEquipment(
  page: number,
  limit: number,
): Promise<FetchResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/user/equipment?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  return response.json();
}

export default function YourEquipmentPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-equipment", page, limit],
    queryFn: () => fetchUserEquipment(page, limit),
    enabled: !!user,
  });

  const equipment = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;

  const pagination = {
    page,
    limit,
    total,
    totalPages,
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to view and manage your custom equipment.
        </p>
        <Button asChild>
          <Link href="/auth/login?redirect=/equipment/my-equipment">
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Your Equipment
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your custom equipment items
          </p>
        </div>
        <Button asChild>
          <Link href="/equipment/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Equipment
          </Link>
        </Button>
      </div>

      {equipment.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No equipment yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first custom equipment item to get started.
          </p>
          <Button asChild>
            <Link href="/equipment/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Equipment
            </Link>
          </Button>
        </div>
      ) : (
        <EquipmentList
          equipment={equipment}
          pagination={pagination}
          loading={isLoading}
          error={error instanceof Error ? error.message : undefined}
          currentUserId={user?.id}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onRetry={() => refetch()}
          view="grid"
        />
      )}
    </div>
  );
}
