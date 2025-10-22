"use client";

import { Pencil, Trash2, Eye, EyeOff, Copy, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Author {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username_slug: string | null;
}

interface MonsterOwnershipCardProps {
  monsterId: string;
  monsterName: string;
  monsterType: "official" | "user" | "custom";
  isPublic: boolean;
  author: Author | null;
  isOwner: boolean;
  createdAt?: string;
  updatedAt?: string;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility?: () => void;
}

export function MonsterOwnershipCard({
  monsterId,
  monsterName,
  monsterType,
  isPublic,
  author,
  isOwner,
  createdAt,
  updatedAt,
  onDelete,
  onDuplicate,
  onToggleVisibility,
}: MonsterOwnershipCardProps) {
  const isCustomMonster = monsterType === "user" || monsterType === "custom";
  const isOfficialMonster = monsterType === "official";

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold mb-2">
                {isOwner ? "Your Monster" : "Monster Information"}
              </p>
              {isOfficialMonster && (
                <p className="text-sm text-muted-foreground">
                  Official Shadowdark content
                </p>
              )}
            </div>
            <Badge
              variant={isOwner ? "default" : "secondary"}
              className="text-base px-3 py-1"
            >
              {isOfficialMonster
                ? "Official"
                : isOwner
                  ? "Owned"
                  : isPublic
                    ? "Community"
                    : "Private"}
            </Badge>
          </div>

          {/* Author Information */}
          {isCustomMonster && author && (
            <>
              <Separator />
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={author.avatar_url || undefined}
                    alt={author.display_name || "User"}
                  />
                  <AvatarFallback>
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  {author.username_slug ? (
                    <Link
                      href={`/users/${author.username_slug}`}
                      className="text-base font-medium hover:underline"
                    >
                      {author.display_name || "Anonymous"}
                    </Link>
                  ) : (
                    <p className="text-base font-medium">
                      {author.display_name || "Anonymous"}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Dates */}
          {isCustomMonster && (createdAt || updatedAt) && (
            <div className="flex items-center gap-6">
              {createdAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(createdAt)}</p>
                </div>
              )}
              {updatedAt && updatedAt !== createdAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(updatedAt)}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isOwner && isCustomMonster && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="default">
                  <Link
                    href={`/monsters/${monsterId}/edit`}
                    className="flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit Monster
                  </Link>
                </Button>
                {onToggleVisibility && (
                  <Button onClick={onToggleVisibility} variant="secondary">
                    {isPublic ? (
                      <EyeOff size={16} className="mr-2" />
                    ) : (
                      <Eye size={16} className="mr-2" />
                    )}
                    {isPublic ? "Make Private" : "Make Public"}
                  </Button>
                )}
                <Button onClick={onDelete} variant="destructive">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </>
          )}

          {/* Duplicate button for non-owners */}
          {!isOwner && (
            <>
              <Separator />
              <Button
                onClick={onDuplicate}
                variant="secondary"
                className="w-full"
              >
                <Copy size={16} className="mr-2" />
                Duplicate to My Collection
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
