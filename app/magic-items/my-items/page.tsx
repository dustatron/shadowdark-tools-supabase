"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MagicItemCard } from "@/components/magic-items/MagicItemCard";
import { MagicItemTable } from "@/components/magic-items/MagicItemTable";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Skeleton } from "@/components/primitives/skeleton";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { useViewMode } from "@/lib/hooks";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createFavoritesMap } from "@/lib/utils/favorites";
import type {
  UserMagicItem,
  MagicItemWithAuthor,
} from "@/lib/types/magic-items";

interface FetchResponse {
  data: MagicItemWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchUserMagicItems(
  query?: string,
  userId?: string,
): Promise<FetchResponse> {
  const params = new URLSearchParams();
  if (query) {
    params.append("q", query);
  }

  const response = await fetch(`/api/user/magic-items?${params.toString()}`);

  if (response.status === 401) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch magic items");
  }

  const result = await response.json();

  // Transform data to MagicItemWithAuthor type
  const transformedData: MagicItemWithAuthor[] = (result.data || []).map(
    (item: UserMagicItem) => ({
      ...item,
      creator_name: null,
      is_public: item.is_public,
      author: userId
        ? {
            id: userId,
            display_name: null,
            avatar_url: null,
          }
        : null,
    }),
  );

  return {
    data: transformedData,
    pagination: result.pagination,
  };
}

async function fetchFavorites(userId: string): Promise<Map<string, string>> {
  const supabase = createClient();
  const { data: favorites } = await supabase
    .from("favorites")
    .select("id, item_id")
    .eq("user_id", userId)
    .eq("item_type", "magic_item");

  if (favorites) {
    return createFavoritesMap(
      favorites.map((fav: { id: string; item_id: string }) => ({
        item_id: fav.item_id,
        favorite_id: fav.id,
      })),
    );
  }

  return new Map();
}

export default function MyMagicItemsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const { view, setView } = useViewMode();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-magic-items", appliedSearch, user?.id],
    queryFn: () => fetchUserMagicItems(appliedSearch, user?.id),
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        return false;
      }
      return failureCount < 2;
    },
  });

  const { data: favoritesMap = new Map() } = useReactQuery({
    queryKey: ["favorites", "magic_item", user?.id],
    queryFn: () => fetchFavorites(user!.id),
    enabled: !!user,
  });

  // Redirect to login on auth error
  if (error instanceof Error && error.message === "AUTH_REQUIRED") {
    router.push("/auth/login?redirect=/magic-items/my-items");
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  const handleFavoriteChange = (
    itemId: string,
    favoriteId: string | undefined,
  ) => {
    // This will be handled by the action menu's internal state
    // and will refetch favorites on the next query
  };

  const handleListChange = (itemId: string, inList: boolean) => {
    // This will be handled by the action menu's internal state
  };

  const handleDeckChange = (itemId: string, inDeck: boolean) => {
    // This will be handled by the action menu's internal state
  };

  const items = data?.data ?? [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Magic Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage your custom magic items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle view={view} onViewChange={setView} />
          <Button asChild>
            <Link href="/magic-items/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Item
            </Link>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {error &&
        !(error instanceof Error && error.message === "AUTH_REQUIRED") && (
          <ErrorAlert
            title="Failed to load magic items"
            message={
              error instanceof Error ? error.message : "An error occurred"
            }
            onRetry={() => refetch()}
          />
        )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={48} />}
          title="No magic items yet"
          description="Create your first custom magic item to get started."
          action={{
            label: "Create Magic Item",
            onClick: () => router.push("/magic-items/create"),
          }}
        />
      ) : view === "table" ? (
        <MagicItemTable
          items={items.map((item) => ({
            ...item,
            item_type: "custom" as const,
            creator_name: null,
          }))}
          currentUserId={user?.id}
          favoritesMap={favoritesMap}
          onFavoriteChange={handleFavoriteChange}
          onListChange={handleListChange}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MagicItemCard
              key={item.id}
              item={item}
              showSource={false}
              currentUserId={user?.id}
              favoriteId={favoritesMap?.get(item.id) || null}
              onFavoriteChange={handleFavoriteChange}
              onListChange={handleListChange}
              onDeckChange={handleDeckChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
