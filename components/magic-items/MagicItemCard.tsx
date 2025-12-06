import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "./SourceBadge";
import Link from "next/link";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
  item_type?: "official" | "custom";
  creator_name?: string | null;
  user_id?: string | null;
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

  return (
    <Link href={`/magic-items/${item.slug}`}>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
        data-testid="magic-item-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
            {showSource && (
              <SourceBadge
                itemType={itemType}
                creatorName={item.creator_name}
                userId={item.user_id}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncatedDescription}
          </p>
          {item.traits.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {item.traits.length} Trait{item.traits.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
