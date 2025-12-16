"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EntityActionMenu } from "@/components/entity-action-menu";
import { ListSelectorModal } from "@/components/list-selector-modal";
import { DeckSelectorModal } from "@/components/deck-selector-modal";
import { useListOperations } from "@/lib/hooks/use-list-operations";
import { useDeckOperations } from "@/lib/hooks/use-deck-operations";
import { toggleFavorite } from "@/app/actions/favorites";
import { toast } from "sonner";
import type { SpellWithAuthor } from "@/lib/types/spells";

interface SpellActionMenuProps {
  spell: SpellWithAuthor;
  userId: string;
  initialFavoriteId?: string;
  onFavoriteChange?: (spellId: string, favoriteId: string | undefined) => void;
  onListChange?: (spellId: string, inList: boolean) => void;
  onDeckChange?: (spellId: string, inDeck: boolean) => void;
}

export function SpellActionMenu({
  spell,
  userId,
  initialFavoriteId,
  onFavoriteChange,
  onListChange,
  onDeckChange,
}: SpellActionMenuProps) {
  const router = useRouter();
  const [listModalOpen, setListModalOpen] = useState(false);
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [favoriteId, setFavoriteId] = useState(initialFavoriteId);
  const [isPending, startTransition] = useTransition();

  // List operations hook
  const {
    lists,
    existingListIds,
    addToList,
    createList,
    isLoading: isLoadingLists,
  } = useListOperations({
    userId,
    entityId: spell.id,
    entityType: "spell",
  });

  // Deck operations hook
  const {
    decks,
    existingDeckIds,
    addToDeck,
    createDeck,
    isLoading: isLoadingDecks,
  } = useDeckOperations({
    userId,
    spellId: spell.id,
  });

  // Check if user owns the spell
  const isOwner = spell.user_id === userId;
  const isFavorited = !!favoriteId;

  // Handlers
  const handleFavoriteToggle = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await toggleFavorite("spell", spell.id, favoriteId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        const newFavoriteId = result.favoriteId || undefined;
        setFavoriteId(newFavoriteId);
        onFavoriteChange?.(spell.id, newFavoriteId);
      } catch (error) {
        toast.error("Failed to update favorite");
      }
    });
  };

  const handleAddToList = () => {
    setListModalOpen(true);
  };

  const handleAddToDeck = () => {
    setDeckModalOpen(true);
  };

  const handleEdit = () => {
    router.push(`/spells/${spell.slug}/edit`);
  };

  const handleSelectList = async (listId: string) => {
    await addToList({
      listId,
      entityId: spell.id,
      entityType: "spell",
    });
    onListChange?.(spell.id, true);
  };

  const handleCreateList = async (
    name: string,
    description?: string,
  ): Promise<string> => {
    const newList = await createList({ name, description });
    return newList.id;
  };

  const handleSelectDeck = async (deckId: string) => {
    await addToDeck({
      deckId,
      spellId: spell.id,
    });
    onDeckChange?.(spell.id, true);
  };

  const handleCreateDeck = async (name: string): Promise<string> => {
    const newDeck = await createDeck({ name });
    return newDeck.id;
  };

  return (
    <>
      <EntityActionMenu
        entity={spell}
        entityType="spell"
        isFavorited={isFavorited}
        isOwner={isOwner}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToList={handleAddToList}
        onAddToDeck={handleAddToDeck}
        onEdit={isOwner ? handleEdit : undefined}
        config={{
          showDeck: true,
          deckEnabled: true,
        }}
      />

      <ListSelectorModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        entityId={spell.id}
        entityType="spell"
        lists={lists}
        existingListIds={existingListIds}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />

      <DeckSelectorModal
        open={deckModalOpen}
        onOpenChange={setDeckModalOpen}
        spellId={spell.id}
        decks={decks}
        existingDeckIds={existingDeckIds}
        onSelectDeck={handleSelectDeck}
        onCreateDeck={handleCreateDeck}
      />
    </>
  );
}
