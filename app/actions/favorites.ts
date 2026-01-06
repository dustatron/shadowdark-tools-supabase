"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteId,
} from "@/lib/api/favorites";

export async function toggleFavorite(
  itemType: "monster" | "spell" | "magic_item",
  itemId: string,
  currentFavoriteId?: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  try {
    if (currentFavoriteId) {
      // Remove from favorites
      await removeFromFavorites(currentFavoriteId);
      revalidatePath("/dashboard");
      return { favoriteId: null };
    } else {
      // Check if already favorited (race condition protection)
      const existingId = await getFavoriteId(user.id, itemType, itemId);
      if (existingId) {
        // Already favorited, return existing ID
        return { favoriteId: existingId };
      }

      // Add to favorites
      const favorite = await addToFavorites(user.id, itemType, itemId);
      revalidatePath("/dashboard");
      return { favoriteId: favorite.id };
    }
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return { error: "Failed to update favorites" };
  }
}
