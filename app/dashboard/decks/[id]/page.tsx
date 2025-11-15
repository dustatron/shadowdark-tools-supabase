"use client";

import { useState, useEffect } from "react";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SpellSelector, SpellCardPreview } from "@/components/deck";
import { ArrowLeft, Plus, Download, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DeckWithSpells } from "@/lib/validations/deck";
import { SpellTable } from "./SpellTable";
import { PageTitle } from "@/components/page-title";

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
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLayout, setExportLayout] = useState<"grid" | "single">("grid");
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck deleted");
      setShowDeleteDrawer(false);
      router.push("/dashboard/decks");
    },
    onError: () => {
      toast.error("Failed to delete deck");
    },
  });

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

  const removeAllMutation = useMutation({
    mutationFn: async () => {
      // Delete all spells sequentially
      const results = [];
      for (const spell of deck?.spells || []) {
        try {
          await removeSpell(deckId, spell.id);
          results.push({ success: true });
        } catch (error) {
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
      setShowDeleteAllDialog(false);
    },
    onError: () => {
      toast.error("Failed to remove all spells");
    },
  });

  // Default to first spell when deck loads
  useEffect(() => {
    if (deck?.spells && deck.spells.length > 0 && !selectedSpellId) {
      setSelectedSpellId(deck.spells[0].id);
    }
  }, [deck, selectedSpellId]);

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
      <div>
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
      <div>
        <div className="text-center">
          <PageTitle title="Deck Not Found" />
          <p className="text-muted-foreground mb-4">
            The deck you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard/decks">
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
    <div>
      {/* Header */}
      <div className="mb-2">
        <div className="flex justify-between p-2">
          <PageTitle title={deck.name} />

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDrawer(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" asChild disabled={deck.spell_count === 0}>
              <Link href={`/dashboard/decks/${deckId}/preview`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Cards
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowExportDialog(true)}
              disabled={deck.spell_count === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>

            <Button
              onClick={() => setShowSpellSelector(true)}
              disabled={deck.spell_count >= 52}
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Spells
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between  flex-wrap mt-2">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/decks">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
          <div className="p-2">
            <Badge variant="destructive">{deck.spell_count} Cards</Badge>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-1">
        {/* Left: Table */}
        <div>
          <SpellTable
            deck={deck}
            removeMutation={removeMutation}
            setShowSpellSelector={setShowSpellSelector}
            selectedSpellId={selectedSpellId || undefined}
            onSelectSpell={setSelectedSpellId}
          />
        </div>

        {/* Right: Preview */}
        <div className="sticky top-4 h-fit">
          {deck.spell_count === 0 ? (
            <div className="border-2 border-dashed  p-12 text-center">
              <p className="text-muted-foreground">
                Add spells to preview cards
              </p>
            </div>
          ) : selectedSpellId ? (
            <div className="border p-2">
              <h3 className="text-sm font-medium mb-4">Card Preview</h3>
              <SpellCardPreview
                spell={deck.spells.find((s) => s.id === selectedSpellId)!}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed  p-12 text-center">
              <p className="text-muted-foreground">Select a spell to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Spell Selector Dialog */}
      <SpellSelector
        deckId={deckId}
        existingSpellIds={existingSpellIds}
        open={showSpellSelector}
        onOpenChange={setShowSpellSelector}
      />

      {/* Delete Options Drawer */}
      <Drawer
        open={showDeleteDrawer}
        onOpenChange={setShowDeleteDrawer}
        direction="right"
      >
        <DrawerContent className="bg-background">
          <DrawerHeader>
            <DrawerTitle>Delete Options</DrawerTitle>
            <DrawerDescription>
              Choose what you&apos;d like to delete
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-3">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => removeAllMutation.mutate()}
              disabled={deck.spell_count === 0 || removeAllMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {removeAllMutation.isPending
                ? "Deleting..."
                : `Delete All Cards (${deck.spell_count})`}
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? "Deleting..." : "Delete Entire Deck"}
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Export Drawer */}
      <Drawer
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Export Deck as PDF</DrawerTitle>
            <DrawerDescription>
              Choose a layout for your PDF export
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:bg-accent transition-colors">
                <input
                  type="radio"
                  name="layout"
                  value="grid"
                  checked={exportLayout === "grid"}
                  onChange={(e) => setExportLayout(e.target.value as "grid")}
                  className="w-4 h-4 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium">Grid Layout (9 per page)</div>
                  <div className="text-sm text-muted-foreground">
                    3x3 grid on 8.5&quot; x 11&quot; pages - efficient for
                    printing
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:bg-accent transition-colors">
                <input
                  type="radio"
                  name="layout"
                  value="single"
                  checked={exportLayout === "single"}
                  onChange={(e) => setExportLayout(e.target.value as "single")}
                  className="w-4 h-4 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium">Single Card Layout</div>
                  <div className="text-sm text-muted-foreground">
                    One 2.5&quot; x 3.5&quot; card per page - easy to cut
                  </div>
                </div>
              </label>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={() => exportMutation.mutate(exportLayout)}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? "Generating..." : "Export PDF"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
