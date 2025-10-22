"use client";

import { useState, useTransition } from "react";
import { Button } from "@mantine/core";
import { Heart } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { toggleFavorite } from "@/app/actions/favorites";

interface FavoriteButtonProps {
  itemId: string;
  itemType: "monster" | "spell";
  initialFavoriteId?: string;
  compact?: boolean;
}

export function FavoriteButton({
  itemId,
  itemType,
  initialFavoriteId,
  compact = false,
}: FavoriteButtonProps) {
  const [favoriteId, setFavoriteId] = useState(initialFavoriteId);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleFavorite(itemType, itemId, favoriteId);

        if (result.error) {
          notifications.show({
            title: "Error",
            message: result.error,
            color: "red",
          });
          return;
        }

        setFavoriteId(result.favoriteId || undefined);

        notifications.show({
          title: "Success",
          message: result.favoriteId
            ? "Added to favorites"
            : "Removed from favorites",
          color: "green",
        });
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
      }
    });
  };

  const isFavorited = !!favoriteId;

  return (
    <Button
      variant={compact ? "subtle" : "outline"}
      size={compact ? "xs" : "sm"}
      onClick={handleToggle}
      loading={isPending}
      leftSection={
        <Heart
          size={16}
          fill={isFavorited ? "currentColor" : "none"}
          className={isFavorited ? "text-red-500" : ""}
        />
      }
    >
      {!compact && (isFavorited ? "Favorited" : "Favorite")}
    </Button>
  );
}
