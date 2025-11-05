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
import { SpellCard, SpellSelector } from "@/components/deck";
import { ArrowLeft, Plus, Download, Trash2 } from "lucide-react";
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
              This feature is coming soon! PDF export with customizable layouts
              will be available in the next release.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
