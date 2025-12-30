import { type AdventureListItem } from "@/lib/types/adventure-lists";
import { Card, CardContent, CardHeader } from "../primitives/card";
import { Ban } from "lucide-react";
import { Button } from "../primitives/button";
import Link from "next/link";

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
  if (item.item_type === "equipment") {
    return `/equipment/${item.item_id}`;
  }
  return "";
};

export function AdventureListDisplayItem({
  item,
  isOwner,
  onRemove,
}: AdventureListItemProps) {
  const itemLink = getItemLink(item);
  console.log("item", item);

  const displayName = item.name || `Unknown ${item.item_type}`;

  return (
    <Card>
      <CardHeader className="p-0">
        <div className="bg-black text-white px-3 py-2">
          <Link href={itemLink} className={`font-medium`}>
            <h2 className="text-xl font-black">{displayName}</h2>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between p-2">
        <div>
          {item.notes && <p className="text-md mt-1">{item.notes}</p>}
          {item.details && (
            <div className="text-lg mt-1">
              {item.item_type === "monster" && (
                <div>
                  <span>Level {item.details?.challenge_level} </span>
                  <div>
                    HP {item.details?.hit_points} | AC{" "}
                    {item.details?.armor_class} | MV {item.details?.speed}
                  </div>
                  <div>
                    Locations:{" "}
                    {item.details.tags?.location?.map((location) => (
                      <span key={location}>{location}</span>
                    ))}
                  </div>
                  <div>
                    Types:{" "}
                    {item.details.tags?.type?.map((type) => (
                      <span key={type}>{type}</span>
                    ))}
                  </div>
                </div>
              )}
              {item.item_type === "spell" && (
                <span>
                  Tier {item.details?.tier} • {item.details?.range} •{" "}
                  {item.details?.duration}
                </span>
              )}
              {item.item_type === "magic_item" && (
                <span>{item?.description}</span>
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
            <Ban className="w-4 h-4" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
