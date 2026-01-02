import { Button } from "@/components/primitives/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { UseMutationResult } from "@tanstack/react-query";
import { Plus, Trash2, Sparkles, BookOpen } from "lucide-react";
import { Badge } from "@/components/primitives/badge";
import type { SpellForDeck, MagicItemForDeck } from "@/lib/validations/deck";

// Union type for combined deck items
export type DeckItem =
  | { type: "spell"; data: SpellForDeck }
  | { type: "magic_item"; data: MagicItemForDeck };

type DeckItemsTableProps = {
  spells: SpellForDeck[];
  magicItems: MagicItemForDeck[];
  itemCount: number;
  onAddSpell: () => void;
  onAddMagicItem: () => void;
  removeSpellMutation: UseMutationResult<
    unknown,
    Error,
    { spellId: string },
    unknown
  >;
  removeMagicItemMutation: UseMutationResult<
    unknown,
    Error,
    { itemId: string },
    unknown
  >;
  selectedItemId?: string;
  selectedItemType?: "spell" | "magic_item";
  onSelectItem?: (id: string, type: "spell" | "magic_item") => void;
};

export function DeckItemsTable({
  spells,
  magicItems,
  itemCount,
  onAddSpell,
  onAddMagicItem,
  removeSpellMutation,
  removeMagicItemMutation,
  selectedItemId,
  selectedItemType,
  onSelectItem,
}: DeckItemsTableProps) {
  // Combine spells and magic items into unified list
  const items: DeckItem[] = [
    ...spells.map((spell): DeckItem => ({ type: "spell", data: spell })),
    ...magicItems.map((item): DeckItem => ({ type: "magic_item", data: item })),
  ];

  if (itemCount === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">No cards in this deck yet</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={onAddSpell} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Spell
          </Button>
          <Button onClick={onAddMagicItem} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Magic Item
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 border-r-2 text-center">#</TableHead>
            <TableHead className="w-16">Type</TableHead>
            <TableHead className="w-40">Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const isSelected =
              selectedItemId === item.data.id && selectedItemType === item.type;
            const isSpell = item.type === "spell";

            return (
              <TableRow
                key={`${item.type}-${item.data.id}`}
                onClick={() => onSelectItem?.(item.data.id, item.type)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectItem?.(item.data.id, item.type);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Select ${item.data.name}`}
                className={`cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${
                  isSelected ? "bg-accent" : ""
                }`}
              >
                <TableCell className="font-medium font-black border-r-2 text-center">
                  {index + 1}
                </TableCell>
                <TableCell>
                  {isSpell ? (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-fit"
                    >
                      <BookOpen className="w-3 h-3" />
                      Spell
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 w-fit"
                    >
                      <Sparkles className="w-3 h-3" />
                      Item
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.data.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {isSpell ? (
                    <span>
                      Tier {(item.data as SpellForDeck).tier} &middot;{" "}
                      {(item.data as SpellForDeck).classes.join(", ")}
                    </span>
                  ) : (
                    <span className="line-clamp-1">
                      {(item.data as MagicItemForDeck).traits
                        ?.map((t) => t.name)
                        .join(", ") || "Magic Item"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSpell) {
                        removeSpellMutation.mutate({ spellId: item.data.id });
                      } else {
                        removeMagicItemMutation.mutate({
                          itemId: item.data.id,
                        });
                      }
                    }}
                    disabled={
                      removeSpellMutation.isPending ||
                      removeMagicItemMutation.isPending
                    }
                    aria-label={`Remove ${item.data.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
