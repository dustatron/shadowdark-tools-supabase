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
} from "@/components/primitives/table";
import { Badge } from "@/components/primitives/badge";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { getTierColor } from "@/lib/utils/shadowdark-colors";

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
