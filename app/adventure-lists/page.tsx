"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdventureList } from "@/lib/types/adventure-lists";
import { AdventureListCard } from "@/components/adventure-lists/AdventureListCard";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Plus, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/primitives/tabs";

async function fetchLists(
  type: "my-lists" | "public-lists",
  search: string,
): Promise<AdventureList[]> {
  const endpoint =
    type === "my-lists"
      ? "/api/adventure-lists"
      : "/api/adventure-lists/public";

  const url = new URL(endpoint, window.location.origin);
  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch lists");

  const data = await response.json();
  return data.data || [];
}

async function deleteList(id: string): Promise<void> {
  const response = await fetch(`/api/adventure-lists/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete list");
}

export default function AdventureListsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [activeTab, setActiveTab] = useState<"my-lists" | "public-lists">(
    "my-lists",
  );

  const { data: lists = [], isLoading: isLoadingMyLists } = useQuery({
    queryKey: ["adventure-lists", "my-lists", debouncedSearch],
    queryFn: () => fetchLists("my-lists", debouncedSearch),
    enabled: activeTab === "my-lists",
  });

  const { data: publicLists = [], isLoading: isLoadingPublicLists } = useQuery({
    queryKey: ["adventure-lists", "public-lists", debouncedSearch],
    queryFn: () => fetchLists("public-lists", debouncedSearch),
    enabled: activeTab === "public-lists",
  });

  const deleteMutation = useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adventure-lists"] });
      toast.success("List deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete list");
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return;
    deleteMutation.mutate(id);
  };

  const isLoading =
    activeTab === "my-lists" ? isLoadingMyLists : isLoadingPublicLists;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Adventure Lists</h1>
          <p className="text-muted-foreground mt-1">
            Manage your collections of monsters, spells, and items for your
            games.
          </p>
        </div>
        <Button asChild>
          <Link href="/adventure-lists/new">
            <Plus className="w-4 h-4 mr-2" />
            Create New List
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lists..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="my-lists"
        onValueChange={(value) =>
          setActiveTab(value as "my-lists" | "public-lists")
        }
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="my-lists">My Lists</TabsTrigger>
          <TabsTrigger value="public-lists">Public Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="my-lists" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <AdventureListCard
                  key={list.id}
                  list={list}
                  isOwner={true}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">No lists found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "Create your first adventure list to get started."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/adventure-lists/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create List
                  </Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-lists" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : publicLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicLists.map((list) => (
                <AdventureListCard key={list.id} list={list} isOwner={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">No public lists found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search query.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
