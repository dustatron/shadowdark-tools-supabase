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
} from "@/components/primitives/table";
import { Badge } from "@/components/primitives/badge";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { EquipmentItem } from "@/lib/types/equipment";
import { EquipmentActionMenu } from "./EquipmentActionMenu";

interface EquipmentTableProps {
  equipment: EquipmentItem[];
  currentUserId?: string;
}

// Wrapper component to render action menu in table cell
function ActionCell({
  equipment,
  userId,
}: {
  equipment: EquipmentItem;
  userId: string;
}) {
  return <EquipmentActionMenu equipment={equipment} userId={userId} />;
}

export function EquipmentTable({
  equipment,
  currentUserId,
}: EquipmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<EquipmentItem>[] = useMemo(
    () => [
      ...(currentUserId
        ? [
            {
              id: "actions",
              header: () => "Action",
              cell: ({ row }: { row: { original: EquipmentItem } }) => (
                <ActionCell equipment={row.original} userId={currentUserId} />
              ),
            } as ColumnDef<EquipmentItem>,
          ]
        : []),
      {
        accessorKey: "name",
        header: ({ column }) => {
          const sortState = column.getIsSorted();
          const ariaLabel = `Sort by name${sortState ? `, currently ${sortState === "asc" ? "ascending" : "descending"}` : ""}`;

          return (
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              aria-label={ariaLabel}
            >
              Name
              <ArrowUpDown className="h-4 w-4" />
            </button>
          );
        },
        cell: ({ row }) => (
          <Link
            href={`/equipment/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "item_type",
        header: ({ column }) => {
          const sortState = column.getIsSorted();
          const ariaLabel = `Sort by type${sortState ? `, currently ${sortState === "asc" ? "ascending" : "descending"}` : ""}`;

          return (
            <button
              className="flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              aria-label={ariaLabel}
            >
              Type
              <ArrowUpDown className="h-4 w-4" />
            </button>
          );
        },
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.item_type}</Badge>
        ),
      },
      {
        accessorKey: "creator_name",
        header: "Creator",
        cell: ({ row }) =>
          row.original.source_type === "custom" && row.original.creator_name ? (
            <span className="text-sm">{row.original.creator_name}</span>
          ) : (
            <Badge variant="outline" className="text-xs">
              Official
            </Badge>
          ),
      },
      {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ row }) => (
          <span>
            {row.original.cost.amount} {row.original.cost.currency}
          </span>
        ),
      },
      {
        accessorKey: "damage",
        header: "Damage",
        cell: ({ row }) =>
          row.original.damage || (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: "armor",
        header: "AC",
        cell: ({ row }) =>
          row.original.armor || (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: "slot",
        header: "Slots",
        cell: ({ row }) => row.original.slot,
      },
      {
        accessorKey: "properties",
        header: "Properties",
        cell: ({ row }) => {
          const props = row.original.properties;
          if (!props || props.length === 0)
            return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {props.slice(0, 2).map((prop, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {prop}
                </Badge>
              ))}
              {props.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{props.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
    ],
    [currentUserId],
  );

  const table = useReactTable({
    data: equipment,
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
                No equipment found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
