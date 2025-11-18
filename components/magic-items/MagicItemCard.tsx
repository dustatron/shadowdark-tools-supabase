import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
}

interface MagicItemCardProps {
  item: MagicItem;
}

export function MagicItemCard({ item }: MagicItemCardProps) {
  // Truncate description to ~150 chars
  const truncatedDescription =
    item.description.length > 150
      ? item.description.slice(0, 150) + "..."
      : item.description;

  return (
    <Link href={`/magic-items/${item.slug}`}>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
        data-testid="magic-item-card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
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
