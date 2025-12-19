import { type AdventureListItem } from "@/lib/types/adventure-lists";
import { Card, CardContent } from "../primitives/card";
import { Link, Trash2 } from "lucide-react";
import { Button } from "../primitives/button";
import { Badge } from "../primitives/badge";

type AdventureListItemProps = {
  item: AdventureListItem;
  isOwner: boolean;
  onRemove: () => void;
};

const getItemLink = (item: AdventureListItem) => {
  if (item.item_type === "monster") {
    return `/monsters/${item.item_id}`;
  }
  if (item.item_type === "spell" && item.slug) {
    return `/spells/${item.slug}`;
  }
  if (item.item_type === "magic_item" && item.slug) {
    return `/magic-items/${item.slug}`;
  }
  return null;
};

export function AdventureListDisplayItem({
  item,
  isOwner,
  onRemove,
}: AdventureListItemProps) {
  const itemLink = getItemLink(item);

  const displayName = item.name || `Unknown ${item.item_type}`;

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {itemLink ? (
              <Link
                href={itemLink}
                className={`font-medium hover:underline ${!item.name ? "text-muted-foreground italic" : ""}`}
              >
                {displayName}
              </Link>
            ) : (
              <h3
                className={`font-medium ${!item.name ? "text-muted-foreground italic" : ""}`}
              >
                {displayName}
              </h3>
            )}
            {item.quantity > 1 && (
              <Badge variant="secondary">x{item.quantity}</Badge>
            )}
          </div>
          {item.notes && (
            <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
          )}
          {item.details && (
            <div className="text-xs text-muted-foreground mt-1">
              {item.item_type === "monster" && (
                <span>
                  CL {item.details.challenge_level} • HP{" "}
                  {item.details.hit_points} • AC {item.details.armor_class}
                </span>
              )}
              {item.item_type === "spell" && (
                <span>
                  Tier {item.details.tier} • {item.details.range} •{" "}
                  {item.details.duration}
                </span>
              )}
              {item.item_type === "equipment" && (
                <span>
                  {item.details.item_type}
                  {item.details.cost &&
                    ` • ${item.details.cost.amount} ${item.details.cost.currency}`}
                </span>
              )}
            </div>
          )}
        </div>

        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
