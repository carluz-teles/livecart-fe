"use client"

import { use } from "react"
import Link from "next/link"
import { AlertTriangle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Order } from "@/types/cart.types"
import { OrderListContext } from "./OrderListContext"

const FIVE_MIN_MS = 5 * 60 * 1000

interface RowProps {
  order: Order
}

export function OrderListRow({ order }: RowProps) {
  const ctx = use(OrderListContext)
  if (!ctx) return null

  const statusCfg = getStatusConfig(ORDER_STATUS_CONFIG, order.status, "active")
  const paymentCfg = getStatusConfig(
    PAYMENT_STATUS_CONFIG,
    order.paymentStatus,
    "pending",
  )

  const isStuck =
    order.paymentStatus === "paid" &&
    order.status !== "completed" &&
    order.paidAt &&
    Date.now() - new Date(order.paidAt).getTime() > FIVE_MIN_MS

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => ctx.actions.openOrder(order.id)}
      data-state={isStuck ? "stuck" : undefined}
    >
      <TableCell className="font-medium">
        <span className="flex items-center gap-2">
          {isStuck && (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          )}
          @{order.customerHandle}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {order.liveTitle || "Sem título"}
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {order.totalItems}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(order.totalAmount)}
      </TableCell>
      <TableCell>
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(order.createdAt)}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/orders/${order.id}`}>Ver detalhes</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
