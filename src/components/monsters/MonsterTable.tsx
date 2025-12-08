"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{
    name: string;
    type: "melee" | "ranged";
    damage: string;
    range: string;
    description?: string;
  }>;
  abilities: Array<{
    name: string;
    description: string;
  }>;
  tags: {
    type: string[];
    location: string[];
  };
  source: string;
  author_notes?: string;
  monster_type?: "official" | "user";
  creator_id?: string;
}

interface MonsterTableProps {
  monsters: Monster[];
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
  preserveSearchParams?: boolean;
}

const columnHelper = createColumnHelper<Monster>();

export function MonsterTable({
  monsters,
  currentUserId,
  favoritesMap,
  preserveSearchParams = false,
}: MonsterTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const searchParams = useSearchParams();

  const getMonsterUrl = (monsterId: string) => {
    if (!preserveSearchParams) {
      return `/monsters/${monsterId}`;
    }

    const params = new URLSearchParams();
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) params.set("q", q);

    const minCl = searchParams.get("min_cl");
    if (minCl) params.set("min_cl", minCl);

    const maxCl = searchParams.get("max_cl");
    if (maxCl) params.set("max_cl", maxCl);

    const types = searchParams.get("types");
    if (types) params.set("types", types);

    const speed = searchParams.get("speed");
    if (speed) params.set("speed", speed);

    const type = searchParams.get("type") || searchParams.get("source");
    if (type && type !== "all") params.set("type", type);

    const page = searchParams.get("page");
    if (page && page !== "1") params.set("page", page);

    const limit = searchParams.get("limit");
    if (limit && limit !== "20") params.set("limit", limit);

    const view = searchParams.get("view");
    if (view) params.set("view", view);

    const queryString = params.toString();
    return queryString
      ? `/monsters/${monsterId}?${queryString}`
      : `/monsters/${monsterId}`;
  };

  const getCLColor = (cl: number) => {
    if (cl <= 3)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (cl <= 7)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (cl <= 12)
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
            itemType="monster"
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

    // Challenge Level column (sortable)
    columnHelper.accessor("challenge_level", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          CL
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
        <Badge className={getCLColor(row.original.challenge_level)}>
          {row.original.challenge_level}
        </Badge>
      ),
    }),

    // HP column (sortable)
    columnHelper.accessor("hit_points", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          HP
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      ),
      cell: ({ row }) => row.original.hit_points,
    }),

    // AC column (sortable)
    columnHelper.accessor("armor_class", {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          AC
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      ),
      cell: ({ row }) => row.original.armor_class,
    }),

    // Speed column (non-sortable, hidden on mobile)
    columnHelper.accessor("speed", {
      header: () => <span className="hidden md:inline">Speed</span>,
      cell: ({ row }) => (
        <span className="hidden md:inline text-muted-foreground">
          {row.original.speed}
        </span>
      ),
    }),

    // Source column (non-sortable, hidden on mobile)
    columnHelper.accessor("source", {
      header: () => <span className="hidden lg:inline">Source</span>,
      cell: ({ row }) => (
        <span className="hidden lg:inline">
          <Badge variant="outline">
            {row.original.source === "Custom"
              ? "User Created"
              : "Shadowdark Core"}
          </Badge>
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: monsters,
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
                      href={getMonsterUrl(row.original.id)}
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
              No monsters found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
