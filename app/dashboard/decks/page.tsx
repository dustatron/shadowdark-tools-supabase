"use client";

import { useState } from "react";
import { DeckList, DeckForm } from "@/components/deck";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/page-title";

export default function DecksPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <PageTitle title="Spell Decks" />
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Deck
        </Button>
      </div>

      <DeckList onCreateClick={() => setShowCreateDialog(true)} />

      <DeckForm open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
