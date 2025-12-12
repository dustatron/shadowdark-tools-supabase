import { AdventureList } from "@/lib/types/adventure-lists";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Edit, Trash2, Eye, Lock, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AdventureListCardProps {
  list: AdventureList;
  isOwner: boolean;
  onDelete?: (id: string) => void;
}

export function AdventureListCard({
  list,
  isOwner,
  onDelete,
}: AdventureListCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <Link
        href={`/adventure-lists/${list.id}`}
        className="relative h-32 w-full bg-muted block"
      >
        {list.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={list.image_url}
            alt={list.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2">
          {list.is_public ? (
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
            >
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
            >
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2">
        <Link href={`/adventure-lists/${list.id}`}>
          <CardTitle className="line-clamp-1 text-lg hover:underline">
            {list.title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {list.description || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">
            {list.item_counts?.monsters || 0} Monsters
          </Badge>
          <Badge variant="outline">
            {list.item_counts?.spells || 0} Spells
          </Badge>
          <Badge variant="outline">
            {list.item_counts?.magic_items || 0} Items
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between border-t bg-muted/20">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/adventure-lists/${list.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </Link>
        </Button>

        {isOwner && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/adventure-lists/${list.id}/edit`}>
                <Edit className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(list.id)}
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
