import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UseMutationResult } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Deck =
  | {
      id: string;
      user_id: string;
      name: string;
      created_at: Date;
      updated_at: Date;
      spell_count: number;
      spells: {
        id: string;
        name: string;
        tier: number;
        duration: string;
        range: string;
        description: string;
        classes: string[];
      }[];
    }
  | undefined;

type SpellTableProps = {
  deck: Deck;
  setShowSpellSelector: (isShowing: boolean) => void;
  removeMutation: UseMutationResult<
    any,
    Error,
    {
      spellId: string;
    },
    unknown
  >;
  selectedSpellId?: string;
  onSelectSpell?: (spellId: string) => void;
};
export function SpellTable({
  deck,
  setShowSpellSelector,
  removeMutation,
  selectedSpellId,
  onSelectSpell,
}: SpellTableProps) {
  if (!deck) {
    return null;
  }
  return deck.spell_count === 0 ? (
    <div className="text-center py-12 border-2 border-dashed rounded-lg">
      <p className="text-muted-foreground mb-4">No spells in this deck yet</p>
      <Button onClick={() => setShowSpellSelector(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Spell
      </Button>
    </div>
  ) : (
    <div className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 border-r-2 text-center">#</TableHead>
            <TableHead className="w-40">Name</TableHead>
            <TableHead className="w-20">Tier</TableHead>
            <TableHead className="w-32">Duration</TableHead>
            <TableHead className="w-32">Range</TableHead>
            <TableHead className="w-40">Classes</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deck.spells.map((spell, index) => (
            <TableRow
              key={spell.id}
              onClick={() => onSelectSpell?.(spell.id)}
              className={`cursor-pointer hover:bg-accent ${
                selectedSpellId === spell.id ? "bg-accent" : ""
              }`}
            >
              <TableCell className="font-medium font-black border-r-2 text-center">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{spell.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{spell.tier}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {spell.duration}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {spell.range}
              </TableCell>
              <TableCell className="text-sm">
                {spell.classes.join(", ")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMutation.mutate({ spellId: spell.id });
                  }}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
