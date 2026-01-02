import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMagicItem } from "./fetchers";
import { toast } from "sonner";

type RemoveMagicItemMutationProps = {
  deckId: string;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
};

export function useRemoveMagicItemMutation({
  deckId,
  selectedItemId,
  setSelectedItemId,
}: RemoveMagicItemMutationProps) {
  const queryClient = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: string }) =>
      removeMagicItem(deckId, itemId),
    onSuccess: (_, { itemId }) => {
      // Clear selection if removed item was selected
      if (selectedItemId === itemId) {
        setSelectedItemId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      toast.success("Magic item removed from deck");
    },
    onError: () => {
      toast.error("Failed to remove magic item");
    },
  });

  return removeMutation;
}
