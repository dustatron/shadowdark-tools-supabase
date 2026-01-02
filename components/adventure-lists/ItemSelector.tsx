"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/primitives/input";
import { Button } from "@/components/primitives/button";
import { Card, CardContent } from "@/components/primitives/card";
import { Loader2, Search, Plus } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";

interface ItemSelectorProps {
  itemType: "monster" | "spell" | "magic_item" | "equipment";
  listId: string;
  onItemAdded: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  source?: string;
  challenge_level?: number;
  tier?: number;
  item_type?: string;
  cost?: unknown;
}

function getEndpoint(itemType: ItemSelectorProps["itemType"]): string {
  if (itemType === "monster") return "/api/search/monsters";
  if (itemType === "spell") return "/api/search/spells";
  if (itemType === "magic_item") return "/api/search/magic-items";
  return "/api/equipment";
}

async function searchItems(
  itemType: ItemSelectorProps["itemType"],
  query: string,
): Promise<SearchResult[]> {
  const endpoint = getEndpoint(itemType);
  const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error("Search failed");
  }

  const data = await response.json();
  return data.results || data.data || [];
}

interface AddItemParams {
  listId: string;
  itemType: string;
  itemId: string;
  itemName: string;
}

async function addItemToList({
  listId,
  itemType,
  itemId,
}: AddItemParams): Promise<void> {
  const response = await fetch(`/api/adventure-lists/${listId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item_type: itemType,
      item_id: itemId,
      quantity: 1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 409) {
      throw new Error("DUPLICATE");
    }
    throw new Error(errorData.error || "Failed to add item");
  }
}

export function ItemSelector({
  itemType,
  listId,
  onItemAdded,
}: ItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["item-search", itemType, debouncedSearch],
    queryFn: () => searchItems(itemType, debouncedSearch),
    enabled: !!debouncedSearch,
  });

  const addMutation = useMutation({
    mutationFn: addItemToList,
    onSuccess: (_, variables) => {
      toast.success(`Added ${variables.itemName} to list`);
      onItemAdded();
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "DUPLICATE") {
        toast.error("Item already in list");
      } else {
        toast.error("Failed to add item to list");
      }
    },
  });

  const handleAddItem = (item: SearchResult) => {
    addMutation.mutate({
      listId,
      itemType,
      itemId: item.id,
      itemName: item.name,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={`Search ${itemType.replace("_", " ")}s...`}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.length > 0 ? (
          results.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {itemType === "monster" &&
                      item.challenge_level !== undefined &&
                      `CL ${item.challenge_level}`}
                    {itemType === "spell" &&
                      item.tier !== undefined &&
                      `Tier ${item.tier}`}
                    {itemType === "equipment" &&
                      item.item_type &&
                      item.item_type}
                    {item.source && ` • ${item.source}`}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddItem(item)}
                  disabled={
                    addMutation.isPending &&
                    addMutation.variables?.itemId === item.id
                  }
                >
                  {addMutation.isPending &&
                  addMutation.variables?.itemId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span className="sr-only">Add</span>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : debouncedSearch ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No results found.
          </div>
        ) : null}
      </div>
    </div>
  );
}
