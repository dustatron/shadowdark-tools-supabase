/**
 * Utility functions for working with favorites
 */

/**
 * Creates a lookup map for quick O(1) access to favorite IDs by item ID
 * @param favorites Array of favorite items with item_id and favorite_id
 * @returns Map where key is item_id and value is favorite_id
 */
export function createFavoritesMap(
  favorites: Array<{ item_id: string; favorite_id: string }>,
): Map<string, string> {
  return new Map(favorites.map((fav) => [fav.item_id, fav.favorite_id]));
}

/**
 * Helper to get favorite ID from map with null safety
 * @param map The favorites map
 * @param itemId The item ID to look up
 * @returns The favorite ID or null if not found
 */
export function getFavoriteFromMap(
  map: Map<string, string>,
  itemId: string,
): string | null {
  return map.get(itemId) || null;
}
