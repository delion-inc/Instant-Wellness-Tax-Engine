"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Csv01Icon,
  Edit02Icon,
  UnfoldMoreIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { OrderStatusBadge } from "./order-status-badge";
import type { OrderResponse } from "../../types/order.types";

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return `${(value * 100).toFixed(2)}%`;
};

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: { field: string; direction: "asc" | "desc" };
  onSortChange: (field: string, direction: "asc" | "desc" | null) => void;
  align?: "left" | "right";
}

function SortableHeader({
  label,
  field,
  currentSort,
  onSortChange,
  align = "left",
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;
  const direction = isActive ? currentSort.direction : null;

  const handleClick = () => {
    if (!isActive) {
      onSortChange(field, "asc");
    } else if (direction === "asc") {
      onSortChange(field, "desc");
    } else {
      onSortChange(field, null);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`-ml-3 h-8 gap-1 font-medium ${align === "right" ? "ml-auto -mr-3" : ""}`}
    >
      {label}
      {isActive && direction === "asc" ? (
        <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3.5" />
      ) : isActive && direction === "desc" ? (
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5" />
      ) : (
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          strokeWidth={2}
          className="text-muted-foreground/50 size-3.5"
        />
      )}
    </Button>
  );
}

function buildColumns(
  currentSort: { field: string; direction: "asc" | "desc" },
  onSortChange: (field: string, direction: "asc" | "desc" | null) => void,
): ColumnDef<OrderResponse>[] {
  return [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <div>
          <span className="font-medium">#{row.original.id}</span>
          {row.original.externalId != null && (
            <span className="text-muted-foreground ml-1.5 text-xs">
              ext:{row.original.externalId}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "timestamp",
      header: () => (
        <SortableHeader
          label="Timestamp"
          field="timestamp"
          currentSort={currentSort}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const ts = row.original.timestamp;
        if (!ts) return <span className="text-muted-foreground">-</span>;
        try {
          return (
            <span className="whitespace-nowrap text-sm">
              {format(new Date(ts), "MMM d, yyyy HH:mm")}
            </span>
          );
        } catch {
          return <span className="text-muted-foreground">{ts}</span>;
        }
      },
    },
    {
      accessorKey: "subtotal",
      header: () => (
        <div className="flex justify-end">
          <SortableHeader
            label="Subtotal"
            field="subtotal"
            currentSort={currentSort}
            onSortChange={onSortChange}
            align="right"
          />
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-right block tabular-nums">
          {formatCurrency(row.original.subtotal)}
        </span>
      ),
    },
    {
      accessorKey: "compositeTaxRate",
      header: () => (
        <div className="flex justify-end">
          <SortableHeader
            label="Tax Rate"
            field="compositeTaxRate"
            currentSort={currentSort}
            onSortChange={onSortChange}
            align="right"
          />
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-right block tabular-nums">
          {formatPercent(row.original.compositeTaxRate)}
        </span>
      ),
    },
    {
      accessorKey: "taxAmount",
      header: () => (
        <div className="flex justify-end">
          <SortableHeader
            label="Tax"
            field="taxAmount"
            currentSort={currentSort}
            onSortChange={onSortChange}
            align="right"
          />
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-right block tabular-nums">
          {formatCurrency(row.original.taxAmount)}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: () => (
        <div className="flex justify-end">
          <SortableHeader
            label="Total"
            field="totalAmount"
            currentSort={currentSort}
            onSortChange={onSortChange}
            align="right"
          />
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-right block font-medium tabular-nums">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "csvImported",
      header: "Source",
      cell: ({ row }) =>
        row.original.csvImported ? (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <HugeiconsIcon icon={Csv01Icon} strokeWidth={2} className="size-3" />
            CSV
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-3" />
            Manual
          </Badge>
        ),
    },
  ];
}

interface OrdersTableProps {
  data: OrderResponse[];
  totalElements: number;
  pageSize: number;
  isLoading: boolean;
  currentSort: { field: string; direction: "asc" | "desc" };
  onSortChange: (field: string, direction: "asc" | "desc" | null) => void;
  onRowClick: (order: OrderResponse) => void;
}

export function OrdersTable({
  data,
  totalElements,
  pageSize,
  isLoading,
  currentSort,
  onSortChange,
  onRowClick,
}: OrdersTableProps) {
  const columns = buildColumns(currentSort, onSortChange);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: totalElements,
    state: {
      pagination: { pageIndex: 0, pageSize },
    },
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i}>{typeof col.header === "string" ? col.header : ""}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader data-tour="orders-sort" className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className="cursor-pointer"
                {...(index === 0 ? { "data-tour": "orders-row" } : {})}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-32 text-center"
              >
                No orders found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
