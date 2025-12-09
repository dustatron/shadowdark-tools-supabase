import { Card, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdown-menu";
import { MoreVertical, Edit, Trash, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface ContentCardProps {
  title: string;
  subtitle?: string;
  isPublic?: boolean;
  editUrl?: string;
  onDelete?: () => void;
  onTogglePublic?: () => void;
}

export function ContentCard({
  title,
  subtitle,
  isPublic,
  editUrl,
  onDelete,
  onTogglePublic,
}: ContentCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="font-semibold">{title}</p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {editUrl && (
                <DropdownMenuItem asChild>
                  <Link href={editUrl} className="flex items-center gap-2">
                    <Edit size={16} />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}

              {onTogglePublic && (
                <DropdownMenuItem
                  onClick={onTogglePublic}
                  className="flex items-center gap-2"
                >
                  {isPublic ? <EyeOff size={16} /> : <Eye size={16} />}
                  Make {isPublic ? "Private" : "Public"}
                </DropdownMenuItem>
              )}

              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash size={16} />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {subtitle && (
          <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
        )}

        {isPublic !== undefined && (
          <Badge variant={isPublic ? "default" : "outline"}>
            {isPublic ? "Public" : "Private"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
