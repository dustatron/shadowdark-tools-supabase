"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EntityActionMenu } from "@/components/entity-action-menu";
import { ListSelectorModal } from "@/components/list-selector-modal";
import { useListOperations } from "@/lib/hooks/use-list-operations";
import { toggleFavorite } from "@/app/actions/favorites";
import { toast } from "sonner";
import type { MonsterWithAuthor } from "@/lib/types/monsters";

interface MonsterActionMenuProps {
  monster: MonsterWithAuthor;
  userId: string;
  initialFavoriteId?: string;
  onFavoriteChange?: (
    monsterId: string,
    favoriteId: string | undefined,
  ) => void;
  onListChange?: (monsterId: string, inList: boolean) => void;
}

export function MonsterActionMenu({
  monster,
  userId,
  initialFavoriteId,
  onFavoriteChange,
  onListChange,
}: MonsterActionMenuProps) {
  const router = useRouter();
  const [listModalOpen, setListModalOpen] = useState(false);
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
    entityId: monster.id,
    entityType: "monster",
  });

  // Check if user owns the monster
  const isOwner = monster.user_id === userId;
  const isFavorited = !!favoriteId;

  // Handlers
  const handleFavoriteToggle = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await toggleFavorite("monster", monster.id, favoriteId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        const newFavoriteId = result.favoriteId || undefined;
        setFavoriteId(newFavoriteId);
        onFavoriteChange?.(monster.id, newFavoriteId);
      } catch (error) {
        toast.error("Failed to update favorite");
      }
    });
  };

  const handleAddToList = () => {
    setListModalOpen(true);
  };

  const handleEdit = () => {
    router.push(`/monsters/${monster.id}/edit`);
  };

  const handleSelectList = async (listId: string) => {
    await addToList({
      listId,
      entityId: monster.id,
      entityType: "monster",
    });
    onListChange?.(monster.id, true);
  };

  const handleCreateList = async (
    name: string,
    description?: string,
  ): Promise<string> => {
    const newList = await createList({ name, description });
    return newList.id;
  };

  return (
    <>
      <EntityActionMenu
        entity={monster}
        entityType="monster"
        isFavorited={isFavorited}
        isOwner={isOwner}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToList={handleAddToList}
        onEdit={isOwner ? handleEdit : undefined}
        config={{
          showDeck: true,
          deckEnabled: false,
          deckTooltip: "Deck support for monsters coming soon",
        }}
      />

      <ListSelectorModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        entityId={monster.id}
        entityType="monster"
        lists={lists}
        existingListIds={existingListIds}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />
    </>
  );
}
