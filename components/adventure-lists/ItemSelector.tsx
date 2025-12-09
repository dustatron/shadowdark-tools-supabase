"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/primitives/input";
import { Button } from "@/components/primitives/button";
import { Card, CardContent } from "@/components/primitives/card";
import { Loader2, Search, Plus } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

interface ItemSelectorProps {
  itemType: "monster" | "spell" | "magic_item";
  listId: string;
  onItemAdded: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  source?: string;
  // Additional fields based on type
  challenge_level?: number;
  tier?: number;
}

export function ItemSelector({
  itemType,
  listId,
  onItemAdded,
}: ItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // We need to implement useDebounce hook or use a library
  // For now, I'll assume it exists or implement a simple version
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!debouncedSearch) {
      setResults([]);
      return;
    }

    const searchItems = async () => {
      setIsLoading(true);
      try {
        // Determine the API endpoint based on itemType
        let endpoint = "";
        if (itemType === "monster") endpoint = "/api/search/monsters";
        else if (itemType === "spell") endpoint = "/api/search/spells";
        else if (itemType === "magic_item")
          endpoint = "/api/search/magic-items";

        const response = await fetch(
          `${endpoint}?q=${encodeURIComponent(debouncedSearch)}`,
        );
        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        logger.error("Search error:", error);
        toast.error("Failed to search items");
      } finally {
        setIsLoading(false);
      }
    };

    searchItems();
  }, [debouncedSearch, itemType]);

  const handleAddItem = async (item: SearchResult) => {
    setAddingId(item.id);
    try {
      const response = await fetch(`/api/adventure-lists/${listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_type: itemType,
          item_id: item.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error("Item already in list");
        } else {
          throw new Error(errorData.error || "Failed to add item");
        }
        return;
      }

      toast.success(`Added ${item.name} to list`);
      onItemAdded();
    } catch (error) {
      logger.error("Error adding item:", error);
      toast.error("Failed to add item to list");
    } finally {
      setAddingId(null);
    }
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
                    {item.source && ` • ${item.source}`}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddItem(item)}
                  disabled={addingId === item.id}
                >
                  {addingId === item.id ? (
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
