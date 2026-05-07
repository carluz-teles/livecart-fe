"use client"

import { use } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { OrderListContext } from "./OrderListContext"
import { isOrderERPFailed, orderColumns } from "./OrderList.columns"
import { OrderListEmpty } from "./OrderList.Empty"

// Skeleton widths mapped to each column id. Kept here (not in columns.tsx)
// because they're a Table-rendering concern, not a column definition.
const SKELETON_WIDTH: Record<string, string> = {
  shortId: "w-16",
  customer: "w-32",
  live: "w-32",
  items: "w-24",
  totalAmount: "ml-auto w-20",
  payment: "w-20",
  shipment: "w-20",
  createdAt: "w-20",
  actions: "w-8",
}

export function OrderListTable() {
  const ctx = use(OrderListContext)

  // useReactTable is configured for fully server-side data: manual sorting and
  // pagination, no row-model transforms. Sort state still lives in the page
  // context (read by SortHeader), so we don't pass state.sorting here — the
  // table is purely a structural renderer.
  const table = useReactTable({
    data: ctx?.state.orders ?? [],
    columns: orderColumns,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!ctx) return null
  const { isLoading, error, orders } = ctx.state
  const colCount = orderColumns.length

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === "actions" && "w-[50px]",
                      header.column.columnDef.meta?.align === "right" &&
                        "text-right",
                    )}
                  >
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => {
                // Cascading reveal: each row's shimmer starts ~60ms after the
                // previous one. Reads as one fluid motion instead of five
                // independent skeletons firing at the same beat.
                const delay = { animationDelay: `${i * 60}ms` }
                return (
                  <TableRow key={i}>
                    {orderColumns.map((col) => (
                      <TableCell key={col.id}>
                        <Skeleton
                          className={cn(
                            "h-4",
                            SKELETON_WIDTH[col.id ?? ""] ?? "w-20",
                          )}
                          style={delay}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="h-24 text-center text-destructive"
                >
                  Erro ao carregar pedidos. Tente novamente.
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="p-0">
                  <OrderListEmpty />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const erpFailed = isOrderERPFailed(row.original)
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => ctx.actions.openOrder(row.original.id)}
                    data-state={erpFailed ? "erp_failed" : undefined}
                    className={cn(
                      "group/row cursor-pointer transition-colors duration-150 hover:bg-muted/40",
                      // Failed-ERP rows wear a 3px destructive bar inset on
                      // the left edge. Subtle bg amplifies the cue on hover
                      // without competing with the bar.
                      erpFailed &&
                        "bg-destructive/[0.025] shadow-[inset_3px_0_0_0_hsl(var(--destructive))] hover:bg-destructive/[0.05]",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.align === "right" &&
                            "text-right",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
