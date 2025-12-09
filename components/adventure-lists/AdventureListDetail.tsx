"use client";

import { AdventureList, AdventureListItem } from "@/lib/types/adventure-lists";
import { Button } from "@/components/primitives/button";
import { Badge } from "@/components/primitives/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/primitives/tabs";
import { Edit, Trash2, Plus, Globe, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/primitives/sheet";
import { ItemSelector } from "./ItemSelector";
import { ExportButton } from "./ExportButton";
import {
  exportAdventureListAsJson,
  exportAdventureListAsCsv,
} from "@/lib/utils/export";

interface AdventureListDetailProps {
  list: AdventureList;
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
  };
  isOwner: boolean;
}

export function AdventureListDetail({
  list,
  items,
  isOwner,
}: AdventureListDetailProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSheetTab, setActiveSheetTab] = useState<
    "monster" | "spell" | "magic_item"
  >("monster");

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `/api/adventure-lists/${list.id}/items/${itemId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      toast.success("Item removed from list");
      router.refresh();
    } catch (error) {
      logger.error("Error removing item:", error);
      toast.error("Failed to remove item from list");
    }
  };

  const handleItemAdded = () => {
    router.refresh();
    // We don't close the sheet automatically to allow adding multiple items
  };

  const openSheet = (type: "monster" | "spell" | "magic_item") => {
    setActiveSheetTab(type);
    setIsSheetOpen(true);
  };

  const handleExport = (format: "json" | "csv") => {
    if (format === "json") {
      exportAdventureListAsJson(list, items);
    } else {
      exportAdventureListAsCsv(list, items);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/adventure-lists">
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{list.title}</h1>
          {list.is_public ? (
            <Badge variant="secondary">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          )}
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/adventure-lists/${list.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        )}
      </div>

      {list.image_url && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list.image_url}
            alt={list.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {list.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {list.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {list.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="monsters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monsters">
                Monsters ({items.monsters.length})
              </TabsTrigger>
              <TabsTrigger value="spells">
                Spells ({items.spells.length})
              </TabsTrigger>
              <TabsTrigger value="magic_items">
                Magic Items ({items.magic_items.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monsters" className="space-y-4 mt-4">
              {items.monsters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No monsters in this list.
                </div>
              ) : (
                items.monsters.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    isOwner={isOwner}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))
              )}
              {isOwner && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => openSheet("monster")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Monster
                </Button>
              )}
            </TabsContent>

            <TabsContent value="spells" className="space-y-4 mt-4">
              {items.spells.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No spells in this list.
                </div>
              ) : (
                items.spells.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    isOwner={isOwner}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))
              )}
              {isOwner && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => openSheet("spell")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spell
                </Button>
              )}
            </TabsContent>

            <TabsContent value="magic_items" className="space-y-4 mt-4">
              {items.magic_items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No magic items in this list.
                </div>
              ) : (
                items.magic_items.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    isOwner={isOwner}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))
              )}
              {isOwner && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => openSheet("magic_item")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Magic Item
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-medium">
                  {items.monsters.length +
                    items.spells.length +
                    items.magic_items.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monsters</span>
                <span className="font-medium">{items.monsters.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spells</span>
                <span className="font-medium">{items.spells.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Magic Items</span>
                <span className="font-medium">{items.magic_items.length}</span>
              </div>
              <div className="pt-2 mt-2 border-t">
                <ExportButton onExport={handleExport} className="w-full mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              Add{" "}
              {activeSheetTab === "monster"
                ? "Monster"
                : activeSheetTab === "spell"
                  ? "Spell"
                  : "Magic Item"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ItemSelector
              itemType={activeSheetTab}
              listId={list.id}
              onItemAdded={handleItemAdded}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ListItem({
  item,
  isOwner,
  onRemove,
}: {
  item: AdventureListItem;
  isOwner: boolean;
  onRemove: () => void;
}) {
  const getItemLink = () => {
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

  const itemLink = getItemLink();

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {itemLink ? (
              <Link href={itemLink} className="font-medium hover:underline">
                {item.name}
              </Link>
            ) : (
              <h3 className="font-medium">{item.name}</h3>
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
