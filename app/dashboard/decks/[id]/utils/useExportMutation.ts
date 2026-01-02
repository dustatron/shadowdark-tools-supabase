import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type ExportMutationProps = {
  deckId: string;
  deckName: string | undefined;
  setShowExportDialog: (show: boolean) => void;
};

export function useExportMutation({
  deckId,
  deckName,
  setShowExportDialog,
}: ExportMutationProps) {
  const exportMutation = useMutation({
    mutationFn: async (layout: "grid" | "single") => {
      const response = await fetch(`/api/decks/${deckId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deckName || "deck"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success("PDF downloaded");
      setShowExportDialog(false);
    },
    onError: () => {
      toast.error("Failed to export PDF");
    },
  });

  return exportMutation;
}
