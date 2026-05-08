"use client"

import { use } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, ShoppingBag } from "lucide-react"
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CustomerListContext } from "./CustomerListContext"
import type { Customer } from "@/types/customer.types"

function initialsFromHandle(handle: string) {
  return handle.slice(0, 2).toUpperCase()
}

interface SortHeaderProps {
  column: string
  label: string
  align?: "left" | "right" | "center"
}

function SortHeader({ column, label, align = "left" }: SortHeaderProps) {
  const ctx = use(CustomerListContext)!
  const { sorting } = ctx.state
  const { toggleSort } = ctx.actions
  const active = sorting.sortBy === column
  const Icon = active
    ? sorting.sortOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        align === "right" && "ml-auto",
        align === "center" && "mx-auto",
      )}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

function LoadingRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="mx-auto h-4 w-8" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
    </TableRow>
  )
}

interface CustomerRowProps {
  customer: Customer
}

function CustomerRow({ customer }: CustomerRowProps) {
  const ctx = use(CustomerListContext)!
  const { openCustomer } = ctx.actions

  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => openCustomer(customer.id)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-1 ring-border/60">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initialsFromHandle(customer.handle)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium leading-tight">@{customer.handle}</span>
            {customer.email && (
              <span className="text-xs text-muted-foreground">{customer.email}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
          {customer.totalOrders}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(customer.totalSpent)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(customer.firstOrderAt)}
      </TableCell>
      <TableCell className="text-sm">
        {customer.lastOrderAt ? formatRelativeDate(customer.lastOrderAt) : "-"}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            openCustomer(customer.id)
          }}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver detalhes</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function CustomerListTable() {
  const ctx = use(CustomerListContext)
  if (!ctx) return null
  const { customers, isLoading, error } = ctx.state

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-28 text-center">
              <SortHeader column="total_orders" label="Pedidos" align="center" />
            </TableHead>
            <TableHead className="w-44 text-right">
              <SortHeader column="total_spent" label="Total gasto" align="right" />
            </TableHead>
            <TableHead className="w-40">
              <SortHeader column="first_order_at" label="Primeira compra" />
            </TableHead>
            <TableHead className="w-40">
              <SortHeader column="last_order_at" label="Última compra" />
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <LoadingRow key={i} />)
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-destructive">
                Erro ao carregar clientes. Tente recarregar a página.
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-sm">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                  <p className="font-medium">Nenhum cliente encontrado</p>
                  <p className="text-xs text-muted-foreground">
                    Os clientes aparecem aqui assim que comentam em uma live e
                    geram um carrinho.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
