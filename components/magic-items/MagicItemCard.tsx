import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { SourceBadge } from "./SourceBadge";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { getTransformedImageUrl } from "@/lib/utils/cloudinary";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
  item_type?: "official" | "custom";
  creator_name?: string | null;
  user_id?: string | null;
  image_url?: string | null;
}

interface MagicItemCardProps {
  item: MagicItem;
  showSource?: boolean;
}

export function MagicItemCard({ item, showSource = true }: MagicItemCardProps) {
  // Truncate description to ~150 chars
  const truncatedDescription =
    item.description.length > 150
      ? item.description.slice(0, 150) + "..."
      : item.description;

  // Determine item type - if not provided, assume official
  const itemType = item.item_type || "official";

  // Get thumbnail URL if image exists
  const thumbnailUrl = getTransformedImageUrl(item.image_url, "thumb");

  return (
    <Link href={`/magic-items/${item.slug}`}>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
        data-testid="magic-item-card"
      >
        <div className="flex">
          {/* Thumbnail */}
          <div className="flex-shrink-0 p-4 pr-0">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">
                  {item.name}
                </CardTitle>
                {showSource && (
                  <SourceBadge
                    itemType={itemType}
                    creatorName={item.creator_name}
                    userId={item.user_id}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {truncatedDescription}
              </p>
              {item.traits.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.traits.length} Trait
                    {item.traits.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
}
