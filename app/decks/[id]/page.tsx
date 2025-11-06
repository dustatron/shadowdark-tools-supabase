"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SpellCard, SpellSelector, SpellCardPreview } from "@/components/deck";
import { ArrowLeft, Plus, Download, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import type { DeckWithSpells } from "@/lib/validations/deck";

async function fetchDeck(id: string): Promise<DeckWithSpells> {
  const response = await fetch(`/api/decks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch deck");
  }

  return response.json();
}

async function deleteDeck(id: string) {
  const response = await fetch(`/api/decks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete deck");
  }
}

async function removeSpell(deckId: string, spellId: string) {
  const response = await fetch(`/api/decks/${deckId}/spells/${spellId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove spell");
  }

  return response.json();
}

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = params?.id as string;

  const [showSpellSelector, setShowSpellSelector] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [exportLayout, setExportLayout] = useState<"grid" | "single">("grid");

  const {
    data: deck,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => fetchDeck(deckId),
    enabled: !!deckId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDeck(deckId),
    onSuccess: () => {
      toast.success("Deck deleted");
      router.push("/decks");
    },
    onError: () => {
      toast.error("Failed to delete deck");
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ spellId }: { spellId: string }) =>
      removeSpell(deckId, spellId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      toast.success("Spell removed from deck");
    },
    onError: () => {
      toast.error("Failed to remove spell");
    },
  });

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
      a.download = `${deck?.name || "deck"}.pdf`;
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-20 w-full mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Deck Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The deck you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href="/decks">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const existingSpellIds = deck.spells.map((s) => s.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/decks">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decks
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {deck.name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={deck.spell_count >= 52 ? "default" : "secondary"}>
                {deck.spell_count}/52 Cards
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSpellSelector(true)}
              disabled={deck.spell_count >= 52}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Spells
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(true)}
              disabled={deck.spell_count === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Cards
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(true)}
              disabled={deck.spell_count === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Spells */}
      {deck.spell_count === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No spells in this deck yet
          </p>
          <Button onClick={() => setShowSpellSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Spell
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {deck.spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              onRemove={() => removeMutation.mutate({ spellId: spell.id })}
              compact
            />
          ))}
        </div>
      )}

      {/* Spell Selector Dialog */}
      <SpellSelector
        deckId={deckId}
        existingSpellIds={existingSpellIds}
        open={showSpellSelector}
        onOpenChange={setShowSpellSelector}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deck?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deck.name}&quot; and all its
              spells. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Deck
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Deck as PDF</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a layout for your PDF export:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value="grid"
                  checked={exportLayout === "grid"}
                  onChange={(e) => setExportLayout(e.target.value as "grid")}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Grid Layout (9 per page)</div>
                  <div className="text-sm text-muted-foreground">
                    3x3 grid on 8.5&quot; x 11&quot; pages - efficient for
                    printing
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value="single"
                  checked={exportLayout === "single"}
                  onChange={(e) => setExportLayout(e.target.value as "single")}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">Single Card Layout</div>
                  <div className="text-sm text-muted-foreground">
                    One 2.5&quot; x 3.5&quot; card per page - easy to cut
                  </div>
                </div>
              </label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => exportMutation.mutate(exportLayout)}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? "Generating..." : "Export PDF"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Card Preview</DialogTitle>
            <DialogDescription>
              Preview how your spell cards will look when printed (2.5&quot; x
              3.5&quot;)
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4 justify-items-center">
            {deck.spells.map((spell) => (
              <SpellCardPreview key={spell.id} spell={spell} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
