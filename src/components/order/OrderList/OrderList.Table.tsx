"use client"

import { use } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderListContext } from "./OrderListContext"
import { OrderListRow } from "./OrderList.Row"
import { OrderListEmpty } from "./OrderList.Empty"

const COLUMNS = 8

export function OrderListTable() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { orders, isLoading, error } = ctx.state

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Live</TableHead>
            <TableHead className="text-center">Itens</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))
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
