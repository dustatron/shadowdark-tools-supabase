"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityActionMenu } from "@/components/entity-action-menu";
import { ListSelectorModal } from "@/components/list-selector-modal";
import { useListOperations } from "@/lib/hooks/use-list-operations";
import type { EquipmentItem } from "@/lib/types/equipment";

interface EquipmentActionMenuProps {
  equipment: EquipmentItem;
  userId: string;
  hideViewDetails?: boolean;
  onListChange?: (equipmentId: string, inList: boolean) => void;
}

export function EquipmentActionMenu({
  equipment,
  userId,
  hideViewDetails = false,
  onListChange,
}: EquipmentActionMenuProps) {
  const [listModalOpen, setListModalOpen] = useState(false);
  const router = useRouter();

  // Check if current user owns this equipment (for user equipment)
  const isOwner = "user_id" in equipment && equipment.user_id === userId;

  // List operations hook
  const { lists, existingListIds, addToList, createList } = useListOperations({
    userId,
    entityId: equipment.id,
    entityType: "equipment",
  });

  // Handlers
  const handleAddToList = () => {
    setListModalOpen(true);
  };

  const handleEdit = () => {
    router.push(`/equipment/${equipment.id}/edit`);
  };

  // Favorites not yet implemented for equipment
  const handleFavoriteToggle = () => {
    // TODO: Implement favorites for equipment
  };

  const handleSelectList = async (listId: string) => {
    await addToList({
      listId,
      entityId: equipment.id,
      entityType: "equipment",
    });
    onListChange?.(equipment.id, true);
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
        entity={equipment}
        entityType="equipment"
        detailUrl={hideViewDetails ? undefined : `/equipment/${equipment.id}`}
        isFavorited={false}
        isOwner={isOwner}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToList={handleAddToList}
        onEdit={isOwner ? handleEdit : undefined}
        config={{
          showDeck: true,
          deckEnabled: false,
          deckTooltip: "Deck support for equipment coming soon",
          favoritesEnabled: false,
          favoritesTooltip: "Favorites for equipment coming soon",
        }}
      />

      <ListSelectorModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        entityId={equipment.id}
        entityType="equipment"
        lists={lists}
        existingListIds={existingListIds}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />
    </>
  );
}
