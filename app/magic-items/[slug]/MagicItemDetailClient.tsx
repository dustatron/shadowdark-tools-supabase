"use client";

import { MagicItemActionMenu } from "@/components/magic-items/MagicItemActionMenu";
import { UserMagicItemActions } from "@/components/magic-items/UserMagicItemActions";
import type { MagicItemWithAuthor } from "@/lib/types/magic-items";

interface MagicItemDetailClientProps {
  item: MagicItemWithAuthor;
  userId?: string | null;
  favoriteId?: string | null;
  isOwner?: boolean | null;
}

export function MagicItemDetailClient({
  item,
  userId,
  favoriteId,
  isOwner,
}: MagicItemDetailClientProps) {
  if (!userId) {
    // If user is not logged in, show only the edit button for owners
    if (isOwner) {
      return <UserMagicItemActions itemSlug={item.slug} />;
    }
    return null;
  }

  // Show full action menu for logged-in users
  return (
    <MagicItemActionMenu
      item={item}
      userId={userId}
      initialFavoriteId={favoriteId || undefined}
      hideViewDetails={true} // Hide view details since we're already on the detail page
    />
  );
}
