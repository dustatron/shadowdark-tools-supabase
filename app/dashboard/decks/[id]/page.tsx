"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/primitives/button";
import { Badge } from "@/components/primitives/badge";
import { Skeleton } from "@/components/primitives/skeleton";
import { SpellSelector, SpellCardPreview } from "@/components/deck";
import { ArrowLeft, Plus, Download, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { SpellTable } from "./SpellTable";
import { PageTitle } from "@/components/page-title";
import { Switch } from "@/components/primitives/switch";
import { ExportDrawer } from "./ExportDrawer";
import { DeleteOptionsDrawer } from "./DeleteOptionsDrawer";
import { fetchDeck } from "./utils/fetchers";
import { useRemoveMutation } from "./utils/useRemoveMutation";
import { useDeleteDeckMutation } from "./utils/useDeleteDeckMutation";
import { useRemoveAllMutation } from "./utils/useRemoveAllMutation";
import { useExportMutation } from "./utils/useExportMutation";

export type ExportLayout = "grid" | "single";

export default function DeckDetailPage() {
  const params = useParams();
  const deckId = params?.id as string;

  const [showSpellSelector, setShowSpellSelector] = useState(false);
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLayout, setExportLayout] = useState<ExportLayout>("grid");
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

  const deleteMutation = useDeleteDeckMutation({
    deckId,
    setShowDeleteDrawer,
  });

  const removeMutation = useRemoveMutation({
    deckId,
    selectedSpellId,
    setSelectedSpellId,
  });

  const removeAllMutation = useRemoveAllMutation({
    deckId,
    spells: deck?.spells,
    setSelectedSpellId,
    setShowDeleteDrawer,
  });

  const exportMutation = useExportMutation({
    deckId,
    deckName: deck?.name,
    setShowExportDialog,
  });

  // Default to first spell when deck loads
  useEffect(() => {
    if (deck?.spells && deck.spells.length > 0 && !selectedSpellId) {
      setSelectedSpellId(deck.spells[0].id);
    }
  }, [deck, selectedSpellId]);

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
              <div className="flex justify-between">
                <h3 className="text-sm font-medium mb-4">Card Preview</h3>
                <Switch id="preview-toggle" />
              </div>
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

      <DeleteOptionsDrawer
        showDeleteDrawer={showDeleteDrawer}
        isDeletePending={deleteMutation.isPending}
        isRemoveAllPending={removeAllMutation.isPending}
        mutate={deleteMutation.mutate}
        setShowDeleteDrawer={setShowDeleteDrawer}
        spellCount={deck.spell_count}
        removeAll={removeAllMutation.mutate}
      />
      <ExportDrawer
        exportLayout={exportLayout}
        isPending={exportMutation.isPending}
        mutate={exportMutation.mutate}
        setExportLayout={setExportLayout}
        setShowExportDialog={setShowExportDialog}
        showExportDialog={showExportDialog}
      />
    </div>
  );
}
