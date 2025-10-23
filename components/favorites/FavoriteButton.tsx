"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
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
          toast.error(result.error);
          return;
        }

        setFavoriteId(result.favoriteId || undefined);

        if (result.favoriteId) {
          toast.success("Added to favorites");
        } else {
          toast.success("Removed from favorites");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  };

  const isFavorited = !!favoriteId;

  return (
    <Button
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon-sm" : "sm"}
      onClick={handleToggle}
      disabled={isPending}
      className={isFavorited ? "text-red-500 hover:text-red-600" : ""}
    >
      <Heart
        size={16}
        fill={isFavorited ? "currentColor" : "none"}
        className={isFavorited ? "text-red-500" : ""}
      />
      {!compact && (isFavorited ? "Favorited" : "Favorite")}
    </Button>
  );
}
