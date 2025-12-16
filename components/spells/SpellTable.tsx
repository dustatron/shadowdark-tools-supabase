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
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Heart,
  List,
  Layers,
} from "lucide-react";
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
import { SpellActionMenu } from "@/components/spells/SpellActionMenu";
import { getTierColor } from "@/lib/utils/shadowdark-colors";
import type { AllSpell, SpellWithAuthor } from "@/lib/types/spells";

interface SpellTableProps {
  spells: AllSpell[];
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  inListsSet?: Set<string>;
  inDecksSet?: Set<string>;
  onFavoriteChange?: (spellId: string, favoriteId: string | undefined) => void;
  onListChange?: (spellId: string, inList: boolean) => void;
  onDeckChange?: (spellId: string, inDeck: boolean) => void;
}

const columnHelper = createColumnHelper<AllSpell>();

export function SpellTable({
  spells,
  currentUserId,
  favoritesMap,
  inListsSet,
  inDecksSet,
  onFavoriteChange,
  onListChange,
  onDeckChange,
}: SpellTableProps) {
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
          <TooltipContent>Spell actions menu</TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) =>
        currentUserId ? (
          <SpellActionMenu
            spell={row.original as SpellWithAuthor}
            userId={currentUserId}
            initialFavoriteId={favoritesMap?.get(row.original.id)}
            onFavoriteChange={onFavoriteChange}
            onListChange={onListChange}
            onDeckChange={onDeckChange}
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

    // Tier column (sortable)
    columnHelper.accessor("tier", {
      header: ({ column }) => {
        const sortState = column.getIsSorted();
        const ariaLabel = `Sort by tier${sortState ? `, currently ${sortState === "asc" ? "ascending" : "descending"}` : ""}`;

        return (
          <button
            className="flex items-center gap-1 hover:text-primary"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            aria-label={ariaLabel}
          >
            Tier
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
        <Badge className={getTierColor(row.original.tier)}>
          {row.original.tier}
        </Badge>
      ),
    }),

    // Classes column (non-sortable)
    columnHelper.accessor("classes", {
      header: () => "Classes",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.classes.join(", ")}</span>
      ),
    }),

    // Duration column (non-sortable, hidden on mobile)
    columnHelper.accessor("duration", {
      header: () => <span className="hidden md:inline">Duration</span>,
      cell: ({ row }) => (
        <span className="hidden md:inline text-muted-foreground">
          {row.original.duration}
        </span>
      ),
    }),

    // Range column (non-sortable, hidden on mobile)
    columnHelper.accessor("range", {
      header: () => <span className="hidden md:inline">Range</span>,
      cell: ({ row }) => (
        <span className="hidden md:inline text-muted-foreground">
          {row.original.range}
        </span>
      ),
    }),

    // Source column (non-sortable, hidden on smaller screens)
    columnHelper.accessor("source", {
      header: () => <span className="hidden lg:inline">Source</span>,
      cell: ({ row }) => (
        <span className="hidden lg:inline">
          <Badge variant="outline">
            {row.original.source === "Custom"
              ? "User Created"
              : row.original.source}
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

    // In deck indicator column (non-sortable)
    ...(currentUserId
      ? [
          columnHelper.display({
            id: "inDeck",
            header: () => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex justify-center">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>In deck</TooltipContent>
              </Tooltip>
            ),
            cell: ({ row }) =>
              inDecksSet?.has(row.original.id) ? (
                <span className="flex justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </span>
              ) : null,
            size: 40,
          }),
        ]
      : []),
  ];

  const table = useReactTable({
    data: spells,
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
                  {["actions", "favorite", "inList", "inDeck"].includes(
                    cell.column.id,
                  ) ? (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  ) : (
                    <Link
                      href={`/spells/${row.original.slug}`}
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
              No spells found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
