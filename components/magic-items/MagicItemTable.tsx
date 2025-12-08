"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "./SourceBadge";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
  item_type?: "official" | "custom";
  creator_name?: string | null;
  user_id?: string | null;
}

interface MagicItemTableProps {
  items: MagicItem[];
  currentUserId?: string;
  favoritesMap?: Map<string, string>;
}

export function MagicItemTable({
  items,
  currentUserId,
  favoritesMap,
}: MagicItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<MagicItem>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/magic-items/${row.original.slug}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "traits",
        header: "Traits",
        cell: ({ row }) => {
          const traits = row.original.traits;
          if (traits.length === 0)
            return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {traits.slice(0, 3).map((trait, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {trait.name}
                </Badge>
              ))}
              {traits.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{traits.length - 3}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const desc = row.original.description;
          const truncated = desc.length > 80 ? desc.slice(0, 80) + "..." : desc;
          return (
            <span className="text-sm text-muted-foreground">{truncated}</span>
          );
        },
      },
      {
        accessorKey: "item_type",
        header: "Source",
        cell: ({ row }) => (
          <SourceBadge
            itemType={row.original.item_type || "official"}
            creatorName={row.original.creator_name}
            userId={row.original.user_id}
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </div>
  );
}
