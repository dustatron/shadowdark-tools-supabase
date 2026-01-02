import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSpell } from "./fetchers";
import { toast } from "sonner";

type Spell = { id: string };

type RemoveAllMutationProps = {
  deckId: string;
  spells: Spell[] | undefined;
  setSelectedSpellId: (id: string | null) => void;
  setShowDeleteDrawer: (show: boolean) => void;
};

export function useRemoveAllMutation({
  deckId,
  spells,
  setSelectedSpellId,
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
      return results;
    },
    onSuccess: (results) => {
      setSelectedSpellId(null);
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      const successCount = results.filter((r) => r.success).length;
      toast.success(
        `Removed ${successCount} spell${successCount === 1 ? "" : "s"}`,
      );
      setShowDeleteDrawer(false);
    },
    onError: () => {
      toast.error("Failed to remove all spells");
    },
  });

  return removeAllMutation;
}
