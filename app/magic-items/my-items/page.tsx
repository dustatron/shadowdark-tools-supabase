"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MagicItemCard } from "@/components/magic-items/MagicItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserMagicItem } from "@/lib/types/magic-items";

export default function MyMagicItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<UserMagicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login?redirect=/magic-items/my-items");
      return;
    }

    setIsAuthenticated(true);
    fetchItems();
  };

  const fetchItems = async (query?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query) {
        params.append("q", query);
      }

      const response = await fetch(
        `/api/user/magic-items?${params.toString()}`,
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login?redirect=/magic-items/my-items");
          return;
        }
        throw new Error("Failed to fetch magic items");
      }

      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems(searchQuery);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Magic Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage your custom magic items
          </p>
        </div>
        <Button asChild>
          <Link href="/magic-items/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Item
          </Link>
        </Button>
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

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any magic items yet.
          </p>
          <Button asChild>
            <Link href="/magic-items/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Item
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MagicItemCard
              key={item.id}
              item={{
                ...item,
                item_type: "custom" as const,
                creator_name: null,
              }}
              showSource={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
