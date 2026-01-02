import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSpell, removeMagicItem } from "./fetchers";
import { toast } from "sonner";

type Item = { id: string };

type RemoveAllMutationProps = {
  deckId: string;
  spells: Item[] | undefined;
  magicItems: Item[] | undefined;
  setSelectedItemId: (id: string | null) => void;
  setShowDeleteDrawer: (show: boolean) => void;
};

export function useRemoveAllMutation({
  deckId,
  spells,
  magicItems,
  setSelectedItemId,
  setShowDeleteDrawer,
}: RemoveAllMutationProps) {
  const queryClient = useQueryClient();

  const removeAllMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      for (const spell of spells || []) {
        try {
          await removeSpell(deckId, spell.id);
          results.push({ success: true });
        } catch {
          results.push({ success: false });
        }
      }
      for (const item of magicItems || []) {
        try {
          await removeMagicItem(deckId, item.id);
          results.push({ success: true });
        } catch {
          results.push({ success: false });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      setSelectedItemId(null);
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      const successCount = results.filter((r) => r.success).length;
      toast.success(
        `Removed ${successCount} card${successCount === 1 ? "" : "s"}`,
      );
      setShowDeleteDrawer(false);
    },
    onError: () => {
      toast.error("Failed to remove all cards");
    },
  });

  return removeAllMutation;
}
