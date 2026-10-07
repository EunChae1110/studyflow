"use client";

import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  type LegacyColumnDef,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import type { ReferenceItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const columns: LegacyColumnDef<ReferenceItem, unknown>[] = [
  {
    header: "Source",
    accessorFn: (row: ReferenceItem) => row.source,
    cell: ({ row }: { row: { original: ReferenceItem } }) => (
      <div>
        <p className="font-medium">{row.original.source}</p>
        <p className="text-xs text-muted">{row.original.title}</p>
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }: { row: { original: ReferenceItem } }) => (
      <Badge variant="secondary">{row.original.type ?? "—"}</Badge>
    ),
  },
  {
    header: "Year",
    accessorKey: "year",
    cell: ({ row }: { row: { original: ReferenceItem } }) => row.original.year ?? "—",
  },
  {
    header: "DOI / ID",
    accessorKey: "doi",
    cell: ({ row }: { row: { original: ReferenceItem } }) => (
      <span className="text-xs">{row.original.doi ?? "—"}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: { original: ReferenceItem } }) => {
      const status = row.original.status;
      const className =
        status === "Verified"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : status === "Needs review"
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            : status === "Incomplete"
              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-primary-soft text-primary";

      return <Badge className={className}>{status}</Badge>;
    },
  },
];

export function ReferencesTable({ references }: { references: ReferenceItem[] }) {
  const table = useLegacyTable({
    data: references,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (references.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        No references yet. Verified sources will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Table>
        <TableHeader className="bg-surface-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-surface-muted/70">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
