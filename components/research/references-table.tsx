"use client";

import {
  flexRender,
} from "@tanstack/react-table";
import { getCoreRowModel, type LegacyColumnDef, useLegacyTable } from "@tanstack/react-table/legacy";
import { references } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReferenceRow = (typeof references)[number];

const columns: LegacyColumnDef<ReferenceRow, unknown>[] = [
  {
    header: "Source",
    accessorFn: (row: ReferenceRow) => row.source,
    cell: ({ row }: { row: { original: ReferenceRow } }) => (
      <div>
        <p className="font-medium">{row.original.source}</p>
        <p className="text-xs text-muted">{row.original.title}</p>
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }: { row: { original: ReferenceRow } }) => <Badge variant="secondary">{row.original.type}</Badge>,
  },
  {
    header: "Year",
    accessorKey: "year",
  },
  {
    header: "DOI / ID",
    accessorKey: "doi",
    cell: ({ row }: { row: { original: ReferenceRow } }) => <span className="text-xs">{row.original.doi}</span>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: { original: ReferenceRow } }) => {
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
  {
    id: "action",
    header: "",
    cell: ({ row }: { row: { original: ReferenceRow } }) => (
      <Button size="sm" variant={row.original.status === "Incomplete" ? "secondary" : "ghost"}>
        {row.original.status === "Incomplete" ? "Fix metadata" : "Edit"}
      </Button>
    ),
  },
];

export function ReferencesTable() {
  const table = useLegacyTable({
    data: references as ReferenceRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
