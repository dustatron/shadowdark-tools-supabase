"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Heart, List } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { Badge } from "@/components/primitives/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/primitives/tooltip";
import { MagicItemActionMenu } from "./MagicItemActionMenu";
import type { AllMagicItem } from "@/lib/types/magic-items";

interface MagicItemTableProps {
  items: AllMagicItem[];
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  inListsSet?: Set<string>;
  onFavoriteChange?: (itemId: string, favoriteId: string | undefined) => void;
  onListChange?: (itemId: string, inList: boolean) => void;
}

const columnHelper = createColumnHelper<AllMagicItem>();

export function MagicItemTable({
  items,
  currentUserId,
  favoritesMap,
  inListsSet,
  onFavoriteChange,
  onListChange,
}: MagicItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    // Action menu column (non-sortable)
    columnHelper.display({
      id: "actions",
      header: () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground">Actions</span>
          </TooltipTrigger>
          <TooltipContent>Magic item actions menu</TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) =>
        currentUserId ? (
          <MagicItemActionMenu
            item={row.original}
            userId={currentUserId}
            initialFavoriteId={favoritesMap?.get(row.original.id)}
            onFavoriteChange={onFavoriteChange}
            onListChange={onListChange}
          />
        ) : null,
      size: 40,
    }),

    // Name column (sortable)
    columnHelper.accessor("name", {
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        const ariaLabel = `Sort by name${sortState ? `, currently ${sortState === "asc" ? "ascending" : "descending"}` : ""}`;

        return (
          <button
            className="flex items-center gap-1 hover:text-primary"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            aria-label={ariaLabel}
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        );
      },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    }),

    // Traits column (non-sortable)
    columnHelper.accessor("traits", {
      header: () => "Traits",
      cell: ({ row }) => {
        const traits = row.original.traits || [];
        if (traits.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {traits.slice(0, 2).map((trait, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {trait.name}
              </Badge>
            ))}
            {traits.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{traits.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    }),

    // Description column (non-sortable, hidden on mobile)
    columnHelper.accessor("description", {
      header: () => <span className="hidden md:inline">Description</span>,
      cell: ({ row }) => {
        const desc = row.original.description;
        const truncated = desc.length > 60 ? desc.slice(0, 60) + "..." : desc;
        return (
          <span className="hidden md:inline text-sm text-muted-foreground">
            {truncated}
          </span>
        );
      },
    }),

    // Source column (non-sortable, hidden on smaller screens)
    columnHelper.display({
      id: "source",
      header: () => <span className="hidden lg:inline">Source</span>,
      cell: ({ row }) => (
        <span className="hidden lg:inline">
          <Badge variant="outline">
            {row.original.item_type === "custom"
              ? row.original.creator_name || "User Created"
              : "Official"}
          </Badge>
        </span>
      ),
    }),

    // Favorite indicator column (non-sortable)
    ...(currentUserId
      ? [
          columnHelper.display({
            id: "favorite",
            header: () => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex justify-center">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Favorited</TooltipContent>
              </Tooltip>
            ),
            cell: ({ row }) =>
              favoritesMap?.has(row.original.id) ? (
                <span className="flex justify-center">
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </span>
              ) : null,
            size: 40,
          }),
        ]
      : []),

    // In adventure list indicator column (non-sortable)
    ...(currentUserId
      ? [
          columnHelper.display({
            id: "inList",
            header: () => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex justify-center">
                    <List className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>In adventure list</TooltipContent>
              </Tooltip>
            ),
            cell: ({ row }) =>
              inListsSet?.has(row.original.id) ? (
                <span className="flex justify-center">
                  <List className="h-4 w-4 text-primary" />
                </span>
              ) : null,
            size: 40,
          }),
        ]
      : []),
  ];

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const sortState = header.column.getIsSorted();
              const ariaSort = sortState
                ? sortState === "asc"
                  ? "ascending"
                  : "descending"
                : header.column.getCanSort()
                  ? "none"
                  : undefined;

              return (
                <TableHead key={header.id} aria-sort={ariaSort}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {["actions", "favorite", "inList"].includes(
                    cell.column.id,
                  ) ? (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  ) : (
                    <Link
                      href={`/magic-items/${row.original.slug}`}
                      className="block"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Link>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No magic items found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
