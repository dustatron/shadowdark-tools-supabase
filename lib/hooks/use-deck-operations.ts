"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseDeckOperationsParams {
  userId: string;
  spellId?: string;
}

interface UserDeck {
  id: string;
  name: string;
  spell_count: number;
  created_at: string;
  user_id: string;
}

export function useDeckOperations({
  userId,
  spellId,
}: UseDeckOperationsParams) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch user decks with spell counts
  const { data: decks = [], isLoading: isLoadingDecks } = useQuery({
    queryKey: ["decks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select(
          `
          id,
          name,
          created_at,
          user_id,
          deck_items(count)
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching decks:", error);
        throw error;
      }

      return data.map((deck) => ({
        id: deck.id,
        name: deck.name,
        created_at: deck.created_at,
        user_id: deck.user_id,
        spell_count:
          (deck.deck_items as unknown as { count: number }[])?.[0]?.count || 0,
      })) as UserDeck[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch which decks contain this spell
  const { data: existingDeckIds = [] } = useQuery({
    queryKey: ["deck-contains", spellId],
    queryFn: async () => {
      if (!spellId) return [];

      const { data, error } = await supabase
        .from("deck_items")
        .select("deck_id")
        .eq("spell_id", spellId)
        .in(
          "deck_id",
          decks.map((d) => d.id),
        );

      if (error) throw error;
      return data.map((item) => item.deck_id);
    },
    enabled: !!spellId && decks.length > 0,
  });

  // Create new deck mutation
  const createDeckMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: newDeck, error } = await supabase
        .from("decks")
        .insert({
          user_id: userId,
          name: data.name,
        })
        .select()
        .single();

      if (error) throw error;
      return newDeck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", userId] });
    },
    onError: (error) => {
      console.error("Failed to create deck:", error);
      toast.error("Failed to create deck. Please try again.");
    },
  });

  // Add spell to deck mutation
  const addToDeckMutation = useMutation({
    mutationFn: async (data: { deckId: string; spellId: string }) => {
      const response = await fetch(`/api/decks/${data.deckId}/spells`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spell_id: data.spellId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add spell to deck");
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      const deck = decks.find((d) => d.id === variables.deckId);
      queryClient.invalidateQueries({
        queryKey: ["deck-contains", variables.spellId],
      });
      queryClient.invalidateQueries({ queryKey: ["decks", userId] });
      toast.success(`Added to ${deck?.name || "deck"}`);
    },
    onError: (error: Error) => {
      if (error.message === "Spell already in deck") {
        toast.error("This spell is already in the deck");
      } else if (error.message === "Deck cannot exceed 52 cards") {
        toast.error("Deck is full (max 52 cards)");
      } else {
        console.error("Failed to add to deck:", error);
        toast.error("Failed to add to deck. Please try again.");
      }
    },
  });

  return {
    decks,
    existingDeckIds,
    isLoading: isLoadingDecks,
    createDeck: createDeckMutation.mutateAsync,
    addToDeck: addToDeckMutation.mutateAsync,
    isCreating: createDeckMutation.isPending,
    isAdding: addToDeckMutation.isPending,
  };
}
