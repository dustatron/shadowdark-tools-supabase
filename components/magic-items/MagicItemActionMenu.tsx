"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EntityActionMenu } from "@/components/entity-action-menu";
import { ListSelectorModal } from "@/components/list-selector-modal";
import { OfficialEditWarning } from "@/components/magic-items/OfficialEditWarning";
import { useListOperations } from "@/lib/hooks/use-list-operations";
import { toggleFavorite } from "@/app/actions/favorites";
import { toast } from "sonner";
import type { MagicItemWithAuthor } from "@/lib/types/magic-items";

interface MagicItemActionMenuProps {
  item: MagicItemWithAuthor;
  userId: string;
  isAdmin?: boolean;
  initialFavoriteId?: string;
  hideViewDetails?: boolean;
  onFavoriteChange?: (itemId: string, favoriteId: string | undefined) => void;
  onListChange?: (itemId: string, inList: boolean) => void;
  onDeckChange?: (itemId: string, inDeck: boolean) => void;
}

export function MagicItemActionMenu({
  item,
  userId,
  isAdmin = false,
  initialFavoriteId,
  hideViewDetails = false,
  onFavoriteChange,
  onListChange,
  onDeckChange,
}: MagicItemActionMenuProps) {
  const router = useRouter();
  const [listModalOpen, setListModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
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
    entityId: item.id,
    entityType: "magic_item",
  });

  // Check if user owns the item
  const isOwner = item.user_id === userId;
  const isFavorited = !!favoriteId;

  // Check if item is official (no user_id means official content)
  const isOfficialItem = !item.user_id;
  // Can edit if owner or admin
  const canEdit = isOwner || isAdmin;

  // Handlers
  const handleFavoriteToggle = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await toggleFavorite("magic_item", item.id, favoriteId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        const newFavoriteId = result.favoriteId || undefined;
        setFavoriteId(newFavoriteId);
        onFavoriteChange?.(item.id, newFavoriteId);
      } catch (error) {
        toast.error("Failed to update favorite");
      }
    });
  };

  const handleAddToList = () => {
    setListModalOpen(true);
  };

  const handleEdit = () => {
    // If admin editing official item, show warning first
    if (isAdmin && isOfficialItem) {
      setWarningModalOpen(true);
    } else {
      router.push(`/magic-items/${item.slug}/edit`);
    }
  };

  const handleWarningConfirm = () => {
    setWarningModalOpen(false);
    router.push(`/magic-items/${item.slug}/edit`);
  };

  const handleSelectList = async (listId: string) => {
    await addToList({
      listId,
      entityId: item.id,
      entityType: "magic_item",
    });
    onListChange?.(item.id, true);
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
        entity={item}
        entityType="magic_item"
        detailUrl={hideViewDetails ? undefined : `/magic-items/${item.slug}`}
        isFavorited={isFavorited}
        isOwner={isOwner}
        isAdmin={isAdmin}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToList={handleAddToList}
        onEdit={canEdit ? handleEdit : undefined}
        config={{
          showDeck: false,
          deckEnabled: false,
        }}
      />

      <ListSelectorModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        entityId={item.id}
        entityType="magic_item"
        lists={lists}
        existingListIds={existingListIds}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />

      <OfficialEditWarning
        open={warningModalOpen}
        onOpenChange={setWarningModalOpen}
        onConfirm={handleWarningConfirm}
      />
    </>
  );
}
