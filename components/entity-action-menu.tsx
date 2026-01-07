"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdown-menu";
import { Button } from "@/components/primitives/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitives/tooltip";
import { MoreVertical, Heart, List, Layers, Edit, Eye } from "lucide-react";
import Link from "next/link";

export interface EntityActionMenuProps<T extends { id: string }> {
  entity: T;
  entityType: "monster" | "spell" | "magic_item" | "equipment";
  detailUrl?: string;
  isFavorited: boolean;
  isOwner: boolean;
  isAdmin?: boolean;
  onFavoriteToggle: () => void;
  onAddToList: () => void;
  onAddToDeck?: () => void;
  onEdit?: () => void;
  config?: ActionMenuConfig;
}

export interface ActionMenuConfig {
  showDeck?: boolean;
  deckEnabled?: boolean;
  deckTooltip?: string;
  favoritesEnabled?: boolean;
  favoritesTooltip?: string;
}

export function EntityActionMenu<T extends { id: string }>({
  detailUrl,
  isFavorited,
  isOwner,
  isAdmin = false,
  onFavoriteToggle,
  onAddToList,
  onAddToDeck,
  onEdit,
  config = {},
}: EntityActionMenuProps<T>) {
  const {
    showDeck = true,
    deckEnabled = false,
    deckTooltip = "Deck support coming soon",
    favoritesEnabled = true,
    favoritesTooltip = "Favorites coming soon",
  } = config;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Entity actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {detailUrl && (
          <>
            <DropdownMenuItem asChild>
              <Link href={detailUrl} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {favoritesEnabled ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle();
            }}
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
            />
            <span>
              {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            </span>
          </DropdownMenuItem>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled={true}
                  aria-label="Add to favorites (coming soon)"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Add to Favorites</span>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>{favoritesTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onAddToList();
          }}
          aria-label="Add to adventure list"
        >
          <List className="mr-2 h-4 w-4" />
          <span>Add to Adventure List</span>
        </DropdownMenuItem>

        {showDeck &&
          (deckEnabled && onAddToDeck ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onAddToDeck();
              }}
              aria-label="Add to deck"
            >
              <Layers className="mr-2 h-4 w-4" />
              <span>Add to Deck</span>
            </DropdownMenuItem>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    disabled={true}
                    aria-label="Add to deck (coming soon)"
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    <span>Add to Deck</span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deckTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

        {(isOwner || isAdmin) && onEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
              aria-label="Edit"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
