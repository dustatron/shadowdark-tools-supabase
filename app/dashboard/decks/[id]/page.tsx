"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/primitives/button";
import { Badge } from "@/components/primitives/badge";
import { Skeleton } from "@/components/primitives/skeleton";
import {
  SpellSelector,
  SpellCardPreview,
  SpellCardPreviewReact,
  MagicItemSelector,
  MagicItemCardPreview,
  MagicItemCardPreviewReact,
} from "@/components/deck";
import { Label } from "@/components/primitives/label";
import {
  ArrowLeft,
  Plus,
  Download,
  Trash2,
  Eye,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { DeckItemsTable } from "./DeckItemsTable";
import { PageTitle } from "@/components/page-title";
import { Switch } from "@/components/primitives/switch";
import { ExportDrawer } from "./ExportDrawer";
import { DeleteOptionsDrawer } from "./DeleteOptionsDrawer";
import { fetchDeck } from "./utils/fetchers";
import { useRemoveMutation } from "./utils/useRemoveMutation";
import { useRemoveMagicItemMutation } from "./utils/useRemoveMagicItemMutation";
import { useDeleteDeckMutation } from "./utils/useDeleteDeckMutation";
import { useRemoveAllMutation } from "./utils/useRemoveAllMutation";
import { useExportMutation } from "./utils/useExportMutation";

export type ExportLayout = "grid" | "single";

export default function DeckDetailPage() {
  const params = useParams();
  const deckId = params?.id as string;

  const [showSpellSelector, setShowSpellSelector] = useState(false);
  const [showMagicItemSelector, setShowMagicItemSelector] = useState(false);
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLayout, setExportLayout] = useState<ExportLayout>("grid");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "spell" | "magic_item" | null
  >(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

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
    selectedSpellId: selectedItemType === "spell" ? selectedItemId : null,
    setSelectedSpellId: (id) => {
      if (id === null) {
        setSelectedItemId(null);
        setSelectedItemType(null);
      }
    },
  });

  const removeMagicItemMutation = useRemoveMagicItemMutation({
    deckId,
    selectedItemId: selectedItemType === "magic_item" ? selectedItemId : null,
    setSelectedItemId: (id) => {
      if (id === null) {
        setSelectedItemId(null);
        setSelectedItemType(null);
      }
    },
  });

  const removeAllMutation = useRemoveAllMutation({
    deckId,
    spells: deck?.spells,
    magicItems: deck?.magic_items,
    setSelectedItemId: (id) => {
      setSelectedItemId(id);
      if (id === null) setSelectedItemType(null);
    },
    setShowDeleteDrawer,
  });

  const exportMutation = useExportMutation({
    deckId,
    deckName: deck?.name,
    setShowExportDialog,
  });

  // Default to first item when deck loads
  useEffect(() => {
    if (deck && !selectedItemId) {
      if (deck.spells.length > 0) {
        setSelectedItemId(deck.spells[0].id);
        setSelectedItemType("spell");
      } else if (deck.magic_items.length > 0) {
        setSelectedItemId(deck.magic_items[0].id);
        setSelectedItemType("magic_item");
      }
    }
  }, [deck, selectedItemId]);

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
  const existingMagicItemIds = deck.magic_items.map((i) => i.id);

  // Find selected item data
  const selectedSpell =
    selectedItemType === "spell"
      ? deck.spells.find((s) => s.id === selectedItemId)
      : null;
  const selectedMagicItem =
    selectedItemType === "magic_item"
      ? deck.magic_items.find((i) => i.id === selectedItemId)
      : null;

  const handleSelectItem = (id: string, type: "spell" | "magic_item") => {
    setSelectedItemId(id);
    setSelectedItemType(type);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <div className="flex justify-between p-2 flex-wrap gap-2">
          <PageTitle title={deck.name} />

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDrawer(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" asChild disabled={deck.item_count === 0}>
              <Link href={`/dashboard/decks/${deckId}/preview`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Cards
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowExportDialog(true)}
              disabled={deck.item_count === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>

            <Button
              onClick={() => setShowSpellSelector(true)}
              disabled={deck.item_count >= 52}
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Add Spells
            </Button>
            <Button
              onClick={() => setShowMagicItemSelector(true)}
              disabled={deck.item_count >= 52}
              variant="default"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Add Magic Items
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between flex-wrap mt-2">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/decks">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
          <div className="p-2">
            <Badge variant="destructive">{deck.item_count} Cards</Badge>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-1">
        {/* Left: Table */}
        <div>
          <DeckItemsTable
            spells={deck.spells}
            magicItems={deck.magic_items}
            itemCount={deck.item_count}
            onAddSpell={() => setShowSpellSelector(true)}
            onAddMagicItem={() => setShowMagicItemSelector(true)}
            removeSpellMutation={removeMutation}
            removeMagicItemMutation={removeMagicItemMutation}
            selectedItemId={selectedItemId || undefined}
            selectedItemType={selectedItemType || undefined}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* Right: Preview */}
        <div className="sticky top-4 h-fit">
          {deck.item_count === 0 ? (
            <div className="border-2 border-dashed p-12 text-center">
              <p className="text-muted-foreground">Add cards to preview</p>
            </div>
          ) : selectedSpell ? (
            <div className="border p-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Card Preview</h3>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="preview-toggle"
                    className={`text-xs ${!showPdfPreview ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    Card
                  </Label>
                  <Switch
                    id="preview-toggle"
                    checked={showPdfPreview}
                    onCheckedChange={setShowPdfPreview}
                  />
                  <Label
                    htmlFor="preview-toggle"
                    className={`text-xs ${showPdfPreview ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    PDF
                  </Label>
                </div>
              </div>
              {showPdfPreview ? (
                <SpellCardPreview spell={selectedSpell} />
              ) : (
                <SpellCardPreviewReact spell={selectedSpell} />
              )}
            </div>
          ) : selectedMagicItem ? (
            <div className="border p-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Card Preview</h3>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="preview-toggle"
                    className={`text-xs ${!showPdfPreview ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    Card
                  </Label>
                  <Switch
                    id="preview-toggle"
                    checked={showPdfPreview}
                    onCheckedChange={setShowPdfPreview}
                  />
                  <Label
                    htmlFor="preview-toggle"
                    className={`text-xs ${showPdfPreview ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    PDF
                  </Label>
                </div>
              </div>
              {showPdfPreview ? (
                <MagicItemCardPreview magicItem={selectedMagicItem} />
              ) : (
                <MagicItemCardPreviewReact magicItem={selectedMagicItem} />
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed p-12 text-center">
              <p className="text-muted-foreground">Select a card to preview</p>
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
        currentCardCount={deck.item_count}
      />

      {/* Magic Item Selector Dialog */}
      <MagicItemSelector
        deckId={deckId}
        existingItemIds={existingMagicItemIds}
        open={showMagicItemSelector}
        onOpenChange={setShowMagicItemSelector}
        currentCardCount={deck.item_count}
      />

      <DeleteOptionsDrawer
        showDeleteDrawer={showDeleteDrawer}
        isDeletePending={deleteMutation.isPending}
        isRemoveAllPending={removeAllMutation.isPending}
        mutate={deleteMutation.mutate}
        setShowDeleteDrawer={setShowDeleteDrawer}
        itemCount={deck.item_count}
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
