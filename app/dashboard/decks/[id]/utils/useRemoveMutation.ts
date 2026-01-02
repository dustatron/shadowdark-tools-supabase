import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSpell } from "./fetchers";
import { toast } from "sonner";

type RemoveMutationProps = {
  deckId: string;
  selectedSpellId: string | null;
  setSelectedSpellId: (id: string | null) => void;
};

export function useRemoveMutation({
  deckId,
  selectedSpellId,
  setSelectedSpellId,
}: RemoveMutationProps) {
  const queryClient = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: ({ spellId }: { spellId: string }) =>
      removeSpell(deckId, spellId),
    onSuccess: (_, { spellId }) => {
      // Clear selection if removed spell was selected
      if (selectedSpellId === spellId) {
        setSelectedSpellId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      toast.success("Spell removed from deck");
    },
    onError: () => {
      toast.error("Failed to remove spell");
    },
  });

  return removeMutation;
}
