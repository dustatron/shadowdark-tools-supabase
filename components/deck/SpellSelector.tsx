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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/primitives/popover";
import {
  Search,
  Plus,
  Check,
  ChevronDown,
  Star,
  BookOpen,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { SpellForDeck } from "@/lib/validations/deck";

interface SpellSelectorProps {
  deckId: string;
  existingSpellIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxSpells?: number;
}

async function fetchSpells(
  search: string,
  tiers: number[],
  classes: string[],
  durations: string[],
  spellTypes: string[],
  favoritesOnly: boolean,
): Promise<SpellForDeck[]> {
  const params = new URLSearchParams();

  if (search) {
    params.append("q", search);
  }

  if (tiers.length > 0) {
    params.append("tiers", tiers.join(","));
  }

  if (classes.length > 0) {
    params.append("classes", classes.join(","));
  }

  if (durations.length > 0) {
    params.append("durations", durations.join(","));
  }

  if (spellTypes.length > 0) {
    params.append("spellTypes", spellTypes.join(","));
  }

  if (favoritesOnly) {
    params.append("favorites", "true");
  }

  params.append("limit", "100");

  const response = await fetch(`/api/search/spells?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch spells");
  }

  const data = await response.json();
  return data.results || [];
}

async function addSpellToDeck(deckId: string, spellId: string) {
  const response = await fetch(`/api/decks/${deckId}/spells`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spell_id: spellId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add spell");
  }

  return response.json();
}

export function SpellSelector({
  deckId,
  existingSpellIds,
  open,
  onOpenChange,
  maxSpells = 52,
}: SpellSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedSpellTypes, setSelectedSpellTypes] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: spells, isLoading } = useQuery({
    queryKey: [
      "spells",
      search,
      selectedTiers,
      selectedClasses,
      selectedDurations,
      selectedSpellTypes,
      favoritesOnly,
    ],
    queryFn: () =>
      fetchSpells(
        search,
        selectedTiers,
        selectedClasses,
        selectedDurations,
        selectedSpellTypes,
        favoritesOnly,
      ),
    enabled: open,
  });

  // Extract unique values for filters - fetch all spells initially for filter options
  const { data: allSpells } = useQuery({
    queryKey: ["all-spells-for-filters"],
    queryFn: () => fetchSpells("", [], [], [], [], false),
    enabled: open,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { availableClasses, availableDurations } = useMemo(() => {
    if (!allSpells) return { availableClasses: [], availableDurations: [] };

    const classesSet = new Set<string>();
    const durationsSet = new Set<string>();

    allSpells.forEach((spell) => {
      spell.classes?.forEach((c) => classesSet.add(c));
      if (spell.duration) durationsSet.add(spell.duration);
    });

    return {
      availableClasses: Array.from(classesSet).sort(),
      availableDurations: Array.from(durationsSet).sort(),
    };
  }, [allSpells]);

  const addMutation = useMutation({
    mutationFn: ({ spellId }: { spellId: string }) =>
      addSpellToDeck(deckId, spellId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      toast.success("Spell added to deck");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add spell");
    },
  });

  const addAllMutation = useMutation({
    mutationFn: async (spellIds: string[]) => {
      // Add spells sequentially to handle errors properly
      const results = [];
      for (const spellId of spellIds) {
        try {
          await addSpellToDeck(deckId, spellId);
          results.push({ spellId, success: true });
        } catch (error) {
          results.push({ spellId, success: false });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        toast.success(
          `Added ${successCount} spell${successCount === 1 ? "" : "s"} to deck`,
        );
      }
    },
    onError: () => {
      toast.error("Failed to add spells");
    },
  });

  const handleAddSpell = (spellId: string, spellName: string) => {
    if (existingSpellIds.length >= maxSpells) {
      toast.error(`Deck cannot exceed ${maxSpells} cards`);
      return;
    }

    if (existingSpellIds.includes(spellId)) {
      toast.error("Spell already in deck");
      return;
    }

    addMutation.mutate({ spellId });
  };

  const toggleTier = (tier: number) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );
  };

  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className],
    );
  };

  const toggleDuration = (duration: string) => {
    setSelectedDurations((prev) =>
      prev.includes(duration)
        ? prev.filter((d) => d !== duration)
        : [...prev, duration],
    );
  };

  const clearFilters = () => {
    setSelectedTiers([]);
    setSelectedClasses([]);
    setSelectedDurations([]);
    setSelectedSpellTypes([]);
    setFavoritesOnly(false);
  };

  const hasActiveFilters =
    selectedTiers.length > 0 ||
    selectedClasses.length > 0 ||
    selectedDurations.length > 0 ||
    selectedSpellTypes.length > 0 ||
    favoritesOnly;

  const handleAddAll = () => {
    if (!spells || spells.length === 0) return;

    // Filter out spells already in deck
    const spellsToAdd = spells.filter(
      (spell) => !existingSpellIds.includes(spell.id),
    );

    if (spellsToAdd.length === 0) {
      toast.info("All spells are already in deck");
      return;
    }

    // Check deck limit
    const remainingSpace = maxSpells - existingSpellIds.length;
    const spellsToAddLimited = spellsToAdd.slice(0, remainingSpace);

    if (spellsToAddLimited.length < spellsToAdd.length) {
      toast.warning(
        `Adding ${spellsToAddLimited.length} spells (deck limit reached)`,
      );
    }

    addAllMutation.mutate(spellsToAddLimited.map((s) => s.id));
  };

  const isSpellInDeck = (spellId: string) => existingSpellIds.includes(spellId);
  const isDeckFull = existingSpellIds.length >= maxSpells;
  const availableSpellsCount =
    spells?.filter((s) => !isSpellInDeck(s.id)).length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col gap-0 bg-background"
      >
        <SheetHeader>
          <SheetTitle>Add Spell to Deck</SheetTitle>
          <SheetDescription>
            Search and select spells to add to your deck (
            {existingSpellIds.length}/{maxSpells} cards)
          </SheetDescription>
        </SheetHeader>

        <div className="relative px-4 py-4">
          <Search className="absolute left-7 top-7 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spells..."
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
                    {selectedTiers.length +
                      selectedClasses.length +
                      selectedDurations.length +
                      selectedSpellTypes.length +
                      (favoritesOnly ? 1 : 0)}
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

                  {/* Spell Type Filter */}
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">
                      Spell Type
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="spell-type-official"
                          checked={selectedSpellTypes.includes("official")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSpellTypes([
                                ...selectedSpellTypes,
                                "official",
                              ]);
                            } else {
                              setSelectedSpellTypes(
                                selectedSpellTypes.filter(
                                  (t) => t !== "official",
                                ),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor="spell-type-official"
                          className="text-sm font-normal cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Core Rules
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="spell-type-user"
                          checked={selectedSpellTypes.includes("user")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSpellTypes([
                                ...selectedSpellTypes,
                                "user",
                              ]);
                            } else {
                              setSelectedSpellTypes(
                                selectedSpellTypes.filter((t) => t !== "user"),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor="spell-type-user"
                          className="text-sm font-normal cursor-pointer flex items-center gap-1"
                        >
                          <User className="h-3.5 w-3.5" />
                          Custom Spells
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Tier Filter */}
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">
                      Tier
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          size="sm"
                        >
                          {selectedTiers.length === 0
                            ? "Select tiers..."
                            : `${selectedTiers.length} selected`}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-3">
                        <div className="space-y-2">
                          {[1, 2, 3, 4, 5].map((tier) => (
                            <div
                              key={tier}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`tier-${tier}`}
                                checked={selectedTiers.includes(tier)}
                                onCheckedChange={() => toggleTier(tier)}
                              />
                              <Label
                                htmlFor={`tier-${tier}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                Tier {tier}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Class Filter */}
                  {availableClasses.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold mb-2 block">
                        Class
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            size="sm"
                          >
                            {selectedClasses.length === 0
                              ? "Select classes..."
                              : `${selectedClasses.length} selected`}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3">
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableClasses.map((className) => (
                              <div
                                key={className}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`class-${className}`}
                                  checked={selectedClasses.includes(className)}
                                  onCheckedChange={() => toggleClass(className)}
                                />
                                <Label
                                  htmlFor={`class-${className}`}
                                  className="text-sm font-normal cursor-pointer capitalize"
                                >
                                  {className}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Duration Filter */}
                  {availableDurations.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold mb-2 block">
                        Duration
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            size="sm"
                          >
                            {selectedDurations.length === 0
                              ? "Select durations..."
                              : `${selectedDurations.length} selected`}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3">
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableDurations.map((duration) => (
                              <div
                                key={duration}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`duration-${duration}`}
                                  checked={selectedDurations.includes(duration)}
                                  onCheckedChange={() =>
                                    toggleDuration(duration)
                                  }
                                />
                                <Label
                                  htmlFor={`duration-${duration}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {duration}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

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
        {!isLoading && spells && spells.length > 0 && (
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {availableSpellsCount} spell
              {availableSpellsCount === 1 ? "" : "s"} available
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddAll}
              disabled={
                availableSpellsCount === 0 ||
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
                Loading spells...
              </p>
            )}

            {!isLoading && spells && spells.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No spells found
              </p>
            )}

            {!isLoading &&
              spells?.map((spell) => {
                const inDeck = isSpellInDeck(spell.id);
                const canAdd = !inDeck && !isDeckFull;

                return (
                  <div
                    key={spell.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm truncate">
                          {spell.name}
                        </p>
                        <Badge variant="secondary" className="shrink-0">
                          Tier {spell.tier}
                        </Badge>
                        {spell.classes?.map((className) => (
                          <Badge
                            key={className}
                            variant="outline"
                            className="shrink-0 capitalize"
                          >
                            {className}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          <span className="font-medium">Duration:</span>{" "}
                          {spell.duration}
                        </span>
                        <span>
                          <span className="font-medium">Range:</span>{" "}
                          {spell.range}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={inDeck ? "outline" : "default"}
                      onClick={() => handleAddSpell(spell.id, spell.name)}
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
