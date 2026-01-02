"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Badge } from "@/components/primitives/badge";
import { Checkbox } from "@/components/primitives/checkbox";
import { Label } from "@/components/primitives/label";
import { ScrollArea } from "@/components/primitives/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/primitives/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/primitives/accordion";
import { Search, Plus, Check, Star, BookOpen, User } from "lucide-react";
import { toast } from "sonner";
import type { MagicItemForDeck } from "@/lib/validations/deck";

interface MagicItemSelectorProps {
  deckId: string;
  existingItemIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxCards?: number;
  currentCardCount: number;
}

async function fetchMagicItems(
  search: string,
  itemTypes: string[],
  favoritesOnly: boolean,
): Promise<MagicItemForDeck[]> {
  const params = new URLSearchParams();

  if (search) {
    params.append("q", search);
  }

  // Map UI filter values to API source param
  if (itemTypes.length === 1) {
    if (itemTypes[0] === "official") {
      params.append("source", "official");
    } else if (itemTypes[0] === "user") {
      params.append("source", "custom");
    }
  } else if (itemTypes.length === 0) {
    params.append("source", "all");
  }

  if (favoritesOnly) {
    params.append("favorites", "true");
  }

  params.append("limit", "100");

  const response = await fetch(`/api/search/magic-items?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch magic items");
  }

  const json = await response.json();
  return json.data || [];
}

async function addMagicItemToDeck(deckId: string, magicItemId: string) {
  const response = await fetch(`/api/decks/${deckId}/magic-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ magic_item_id: magicItemId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add magic item");
  }

  return response.json();
}

export function MagicItemSelector({
  deckId,
  existingItemIds,
  open,
  onOpenChange,
  maxCards = 52,
  currentCardCount,
}: MagicItemSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: magicItems, isLoading } = useQuery({
    queryKey: ["magic-items", search, selectedTypes, favoritesOnly],
    queryFn: () => fetchMagicItems(search, selectedTypes, favoritesOnly),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: ({ magicItemId }: { magicItemId: string }) =>
      addMagicItemToDeck(deckId, magicItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      toast.success("Magic item added to deck");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add magic item");
    },
  });

  const addAllMutation = useMutation({
    mutationFn: async (magicItemIds: string[]) => {
      const results = [];
      for (const magicItemId of magicItemIds) {
        try {
          await addMagicItemToDeck(deckId, magicItemId);
          results.push({ magicItemId, success: true });
        } catch {
          results.push({ magicItemId, success: false });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        toast.success(
          `Added ${successCount} magic item${successCount === 1 ? "" : "s"} to deck`,
        );
      }
    },
    onError: () => {
      toast.error("Failed to add magic items");
    },
  });

  const handleAddItem = (magicItemId: string) => {
    if (currentCardCount >= maxCards) {
      toast.error(`Deck cannot exceed ${maxCards} cards`);
      return;
    }

    addMutation.mutate({ magicItemId });
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setFavoritesOnly(false);
  };

  const hasActiveFilters = selectedTypes.length > 0 || favoritesOnly;

  const handleAddAll = () => {
    if (!magicItems || magicItems.length === 0) return;

    // Filter out items already in deck
    const itemsToAdd = magicItems.filter(
      (item) => !existingItemIds.includes(item.id),
    );

    if (itemsToAdd.length === 0) {
      toast.info("All magic items are already in deck");
      return;
    }

    // Check deck limit
    const remainingSpace = maxCards - currentCardCount;
    const itemsToAddLimited = itemsToAdd.slice(0, remainingSpace);

    if (itemsToAddLimited.length < itemsToAdd.length) {
      toast.warning(
        `Adding ${itemsToAddLimited.length} items (deck limit reached)`,
      );
    }

    addAllMutation.mutate(itemsToAddLimited.map((i) => i.id));
  };

  const isItemInDeck = (itemId: string) => existingItemIds.includes(itemId);
  const isDeckFull = currentCardCount >= maxCards;
  const availableItemsCount =
    magicItems?.filter((i) => !isItemInDeck(i.id)).length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col gap-0 bg-background"
      >
        <SheetHeader>
          <SheetTitle>Add Magic Item to Deck</SheetTitle>
          <SheetDescription>
            Search and select magic items to add to your deck (
            {currentCardCount}/{maxCards} cards)
          </SheetDescription>
        </SheetHeader>

        <div className="relative px-4 py-4">
          <Search className="absolute left-7 top-7 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search magic items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="px-4 border-b">
          <Accordion type="single" collapsible>
            <AccordionItem value="filters">
              <AccordionTrigger className="text-sm">
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTypes.length + (favoritesOnly ? 1 : 0)}
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Favorites Toggle */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorites-only"
                      checked={favoritesOnly}
                      onCheckedChange={(checked) =>
                        setFavoritesOnly(checked === true)
                      }
                    />
                    <Label
                      htmlFor="favorites-only"
                      className="text-sm font-normal cursor-pointer flex items-center gap-1"
                    >
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      Show favorites only
                    </Label>
                  </div>

                  {/* Item Type Filter */}
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">
                      Item Type
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="item-type-official"
                          checked={selectedTypes.includes("official")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, "official"]);
                            } else {
                              setSelectedTypes(
                                selectedTypes.filter((t) => t !== "official"),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor="item-type-official"
                          className="text-sm font-normal cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Core Rules
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="item-type-user"
                          checked={selectedTypes.includes("user")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, "user"]);
                            } else {
                              setSelectedTypes(
                                selectedTypes.filter((t) => t !== "user"),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor="item-type-user"
                          className="text-sm font-normal cursor-pointer flex items-center gap-1"
                        >
                          <User className="h-3.5 w-3.5" />
                          Custom Items
                        </Label>
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Add All Button */}
        {!isLoading && magicItems && magicItems.length > 0 && (
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {availableItemsCount} item{availableItemsCount === 1 ? "" : "s"}{" "}
              available
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddAll}
              disabled={
                availableItemsCount === 0 ||
                isDeckFull ||
                addAllMutation.isPending
              }
            >
              {addAllMutation.isPending ? "Adding..." : "Add All"}
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1 h-0 px-4 pb-4">
          <div className="space-y-2 pr-4">
            {isLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Loading magic items...
              </p>
            )}

            {!isLoading && magicItems && magicItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No magic items found
              </p>
            )}

            {!isLoading &&
              magicItems?.map((item) => {
                const inDeck = isItemInDeck(item.id);
                const canAdd = !inDeck && !isDeckFull;

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <Badge variant="outline" className="shrink-0">
                          Magic Item
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      {item.traits && item.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.traits.slice(0, 3).map((trait, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {trait.name}
                            </Badge>
                          ))}
                          {item.traits.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.traits.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant={inDeck ? "outline" : "default"}
                      onClick={() => handleAddItem(item.id)}
                      disabled={!canAdd || addMutation.isPending}
                    >
                      {inDeck ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
          </div>
        </ScrollArea>

        <div className="flex justify-end px-4 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
