"use client"

import { use } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { OrderListContext } from "./OrderListContext"
import { OrderListRow } from "./OrderList.Row"
import { OrderListEmpty } from "./OrderList.Empty"

const COLUMNS = 9

interface SortHeaderProps {
  column: string
  align?: "left" | "right"
  children: React.ReactNode
}

function SortHeader({ column, align = "left", children }: SortHeaderProps) {
  const ctx = use(OrderListContext)
  if (!ctx) return <span>{children}</span>
  const { sorting } = ctx.state
  const { toggleSort } = ctx.actions
  const isActive = sorting.sortBy === column
  const Icon = !isActive ? ArrowUpDown : sorting.sortOrder === "asc" ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className={cn(
        "-mx-2 -my-1 flex items-center gap-1 rounded px-2 py-1 text-left transition-colors hover:bg-muted/60",
        align === "right" && "ml-auto",
        isActive && "text-foreground",
      )}
    >
      <span>{children}</span>
      <Icon
        className={cn(
          "h-3 w-3 transition-opacity",
          isActive ? "opacity-100" : "opacity-40",
        )}
      />
    </button>
  )
}

export function OrderListTable() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { orders, isLoading, error } = ctx.state

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortHeader column="short_id">Pedido</SortHeader>
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Live</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead className="text-right">
              <SortHeader column="total_amount" align="right">Total</SortHeader>
            </TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Envio</TableHead>
            <TableHead>
              <SortHeader column="created_at">Data</SortHeader>
            </TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
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
                  <TableCell><Skeleton className="h-4 w-16" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" style={delay} /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-4 w-20" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" style={delay} /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" style={delay} /></TableCell>
                </TableRow>
              )
            })
          ) : error ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS}
                className="h-24 text-center text-destructive"
              >
                Erro ao carregar pedidos. Tente novamente.
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="p-0">
                <OrderListEmpty />
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => <OrderListRow key={order.id} order={order} />)
          )}
        </TableBody>
      </Table>
    </div>
  )
}
