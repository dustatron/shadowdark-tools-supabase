import { DeckList } from "@/components/deck";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DecksPage() {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <Button asChild>
          <Link href="/dashboard/decks/create">
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Link>
        </Button>
      </div>

      <DeckList />
    </div>
  );
}
