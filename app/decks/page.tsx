"use client";

import { useState } from "react";
import { DeckList, DeckForm } from "@/components/deck";

export default function DecksPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Spell Decks</h1>
        <p className="text-muted-foreground">
          Create and manage your custom spell card decks
        </p>
      </div>

      <DeckList onCreateClick={() => setShowCreateDialog(true)} />

      <DeckForm open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
