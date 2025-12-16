"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseFavoriteToggleParams {
  entityId: string;
  entityType: "monster" | "spell";
  isFavorited: boolean;
  userId: string;
}

export function useFavoriteToggle({
  entityId,
  entityType,
  isFavorited,
  userId,
}: UseFavoriteToggleParams) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async (currentState: boolean) => {
      console.log("Toggle favorite mutation starting:", {
        currentState,
        userId,
        entityType,
        entityId,
      });

      if (currentState) {
        // Remove from favorites
        console.log("Attempting to DELETE favorite");
        const { data, error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", entityType)
          .eq("item_id", entityId)
          .select();

        console.log("Delete result:", { data, error });

        if (error) {
          console.error("Delete error:", error);
          throw error;
        }

        return false; // Return new state
      } else {
        // Add to favorites
        console.log("Attempting to INSERT favorite");
        const { data, error } = await supabase
          .from("favorites")
          .insert({
            user_id: userId,
            item_type: entityType,
            item_id: entityId,
          })
          .select();

        console.log("Insert result:", { data, error });

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        return true; // Return new state
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["favorites", userId, entityType, entityId],
      });

      // Snapshot previous value BEFORE optimistic update
      const previousValue =
        queryClient.getQueryData<boolean>([
          "favorites",
          userId,
          entityType,
          entityId,
        ]) ?? isFavorited;

      // Optimistically update to opposite of current value
      queryClient.setQueryData(
        ["favorites", userId, entityType, entityId],
        !previousValue,
      );

      return { previousValue };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData(
          ["favorites", userId, entityType, entityId],
          context.previousValue,
        );
      }

      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite. Please try again.");
    },
    onSuccess: (newState) => {
      // Set the final state from server response
      queryClient.setQueryData(
        ["favorites", userId, entityType, entityId],
        newState,
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["favorites", userId, entityType],
      });

      toast.success(newState ? "Added to favorites" : "Removed from favorites");
    },
  });

  return { toggleFavorite, isPending };
}
