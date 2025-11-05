"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import type { SpellForDeck } from "@/lib/validations/deck";

interface SpellSelectorProps {
  deckId: string;
  existingSpellIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxSpells?: number;
}

async function fetchSpells(search: string): Promise<SpellForDeck[]> {
  const url = search
    ? `/api/search/spells?q=${encodeURIComponent(search)}`
    : "/api/search/spells?limit=50";

  const response = await fetch(url);

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
  const queryClient = useQueryClient();

  const { data: spells, isLoading } = useQuery({
    queryKey: ["spells", search],
    queryFn: () => fetchSpells(search),
    enabled: open,
  });

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

  const isSpellInDeck = (spellId: string) => existingSpellIds.includes(spellId);
  const isDeckFull = existingSpellIds.length >= maxSpells;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Spell to Deck</DialogTitle>
          <DialogDescription>
            Search and select spells to add to your deck (
            {existingSpellIds.length}/{maxSpells} cards)
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spells..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 py-4">
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
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {spell.name}
                        </p>
                        <Badge variant="secondary" className="shrink-0">
                          Tier {spell.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {spell.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{spell.duration}</span>
                        <span>•</span>
                        <span>{spell.range}</span>
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
