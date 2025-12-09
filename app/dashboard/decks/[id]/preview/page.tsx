"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/primitives/button";
import { Skeleton } from "@/components/primitives/skeleton";
import { SpellCardPreview } from "@/components/deck";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import type { DeckWithSpells } from "@/lib/validations/deck";

async function fetchDeck(id: string): Promise<DeckWithSpells> {
  const response = await fetch(`/api/decks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch deck");
  }

  return response.json();
}

export default function DeckPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.id as string;

  const {
    data: deck,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => fetchDeck(deckId),
    enabled: !!deckId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-[180px] h-[252px]" />
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
            <Link href="/dashboard/decks">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/dashboard/decks/${deckId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deck
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight p-2 ">
              Card Preview
            </h1>
            <p className="text-muted-foreground">
              {deck.name} - {deck.spell_count}{" "}
              {deck.spell_count === 1 ? "card" : "cards"} at print size
              (2.5&quot; x 3.5&quot;)
            </p>
          </div>

          <Button
            variant="default"
            onClick={() => router.push(`/dashboard/decks/${deckId}`)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Card Grid */}
      {deck.spell_count === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No spells in this deck yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap">
          {deck.spells.map((spell) => (
            <SpellCardPreview key={spell.id} spell={spell} />
          ))}
        </div>
      )}
    </div>
  );
}
