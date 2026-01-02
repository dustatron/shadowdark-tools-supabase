import { Button } from "@/components/primitives/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface UserMagicItemActionsProps {
  itemSlug: string;
}

export function UserMagicItemActions({ itemSlug }: UserMagicItemActionsProps) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/magic-items/${itemSlug}/edit`}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </Link>
    </Button>
  );
}
