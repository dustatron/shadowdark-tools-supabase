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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

interface Spell {
  id: string;
  name: string;
  slug: string;
  description: string;
  classes: string[];
  duration: string;
  range: string;
  tier: number;
  source: string;
  author_notes?: string;
  spell_type?: "official" | "user";
  creator_id?: string;
}

interface SpellTableProps {
  spells: Spell[];
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
}

const columnHelper = createColumnHelper<Spell>();

export function SpellTable({
  spells,
  currentUserId,
  favoritesMap,
}: SpellTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const getTierColor = (tier: number) => {
    if (tier <= 1)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (tier <= 2)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (tier <= 3)
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (tier <= 4)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const columns = [
    // Favorite column (non-sortable)
    columnHelper.display({
      id: "favorite",
      header: () => null,
      cell: ({ row }) =>
        currentUserId ? (
          <FavoriteButton
            itemId={row.original.id}
            itemType="spell"
            initialFavoriteId={favoritesMap?.get(row.original.id) || undefined}
            compact={true}
          />
        ) : null,
      size: 40,
    }),

    // Name column (sortable)
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    }),

    // Tier column (sortable)
    columnHelper.accessor("tier", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
      ),
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
          <Badge variant="outline">{row.original.source}</Badge>
        </span>
      ),
    }),
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
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
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
                  {cell.column.id === "favorite" ? (
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
