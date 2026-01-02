import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteDeck } from "./fetchers";
import { toast } from "sonner";

type DeleteDeckMutationProps = {
  deckId: string;
  setShowDeleteDrawer: (show: boolean) => void;
};

export function useDeleteDeckMutation({
  deckId,
  setShowDeleteDrawer,
}: DeleteDeckMutationProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: () => deleteDeck(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck deleted");
      setShowDeleteDrawer(false);
      router.push("/dashboard/decks");
    },
    onError: () => {
      toast.error("Failed to delete deck");
    },
  });

  return deleteMutation;
}
