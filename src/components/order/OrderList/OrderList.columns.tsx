"use client"

import { use } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Facebook,
  Instagram,
  MoreHorizontal,
  Package,
  type LucideIcon,
} from "lucide-react"
import type { Column, ColumnDef, RowData } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  FIRST_PURCHASE_BADGE,
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatTime,
} from "@/lib/format"
import { shipmentStatusBucket, shipmentStatusLabel } from "@/lib/shipment"
import { cn } from "@/lib/utils"
import type { Order, OrderItemPreview } from "@/types/cart.types"
import type { ShipmentStatusBucket } from "@/types/shipment.types"
import { OrderListContext } from "./OrderListContext"

// Augment ColumnMeta so columns can declare their backend sort key (not all
// columns map 1:1 to a backend field) and an alignment hint that the Table
// reads when rendering the <th>/<td> wrapper.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    sortKey?: string
    align?: "left" | "right"
  }
}

const FIVE_MIN_MS = 5 * 60 * 1000

const PLATFORM_ICON: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
}

const SHIPMENT_BUCKET_BADGE: Record<
  ShipmentStatusBucket,
  "default" | "secondary" | "destructive" | "outline"
> = {
  awaiting: "outline",
  in_transit: "secondary",
  delivered: "default",
  issue: "destructive",
  returning: "outline",
  canceled: "secondary",
}

// Stuck = paid but the cart never moved to completed and it's been more than
// 5 minutes since payment was confirmed. Surface a destructive cue so the
// merchant can act before the customer asks.
export function isOrderStuck(order: Order): boolean {
  return Boolean(
    order.paymentStatus === "paid" &&
      order.status !== "completed" &&
      order.paidAt &&
      Date.now() - new Date(order.paidAt).getTime() > FIVE_MIN_MS,
  )
}

// True when the post-payment Tiny order creation rejected this paid cart
// and the merchant still has to retry. Authoritative signal — overrides
// the 5-minute "stuck" heuristic which was best-effort.
export function isOrderERPFailed(order: Order): boolean {
  return order.erpFinalisationStatus === "failed"
}

export const orderColumns: ColumnDef<Order>[] = [
  {
    id: "shortId",
    header: ({ column }) => <SortHeader column={column}>Pedido</SortHeader>,
    enableSorting: true,
    meta: { sortKey: "short_id" },
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium tabular-nums">
        #{row.original.shortId}
      </span>
    ),
  },
  {
    id: "customer",
    header: () => "Cliente",
    cell: ({ row }) => {
      const order = row.original
      const erpFailed = isOrderERPFailed(order)
      const stuck = !erpFailed && isOrderStuck(order)
      const PlatformIcon = PLATFORM_ICON[order.livePlatform] ?? null
      return (
        <div className="flex items-center gap-2">
          {(erpFailed || stuck) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {erpFailed
                  ? "Pagamento confirmado mas o pedido não foi enviado para o ERP. Abra para tentar novamente."
                  : "Pago há mais de 5 minutos sem completar — verifique a integração com o ERP."}
              </TooltipContent>
            </Tooltip>
          )}
          <div className="flex flex-col">
            <span className="font-medium leading-tight">
              {order.customerName || `@${order.customerHandle}`}
            </span>
            <span className="flex items-center gap-1 text-xs leading-tight text-muted-foreground">
              {PlatformIcon && (
                <PlatformIcon className="h-3 w-3" aria-hidden="true" />
              )}
              @{order.customerHandle}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: "live",
    header: () => "Live",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.liveTitle || "Sem título"}
      </span>
    ),
  },
  {
    id: "items",
    header: () => "Itens",
    cell: ({ row }) => (
      <ProductsPreview
        items={row.original.itemsPreview}
        totalItems={row.original.totalItems}
      />
    ),
  },
  {
    id: "totalAmount",
    header: ({ column }) => (
      <SortHeader column={column} align="right">Total</SortHeader>
    ),
    enableSorting: true,
    meta: { sortKey: "total_amount", align: "right" },
    cell: ({ row }) => (
      <div className="flex flex-col items-end leading-tight">
        <span className="font-medium tabular-nums">
          {formatCurrency(row.original.totalAmount)}
        </span>
        {row.original.freeShipping && (
          // The design system has no semantic "success" token yet, so the
          // amber primary would read as a warning here. Tailwind's emerald
          // palette is the closest neutral "positive" cue available without
          // introducing a new CSS variable in this PR.
          <span className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Frete grátis
          </span>
        )}
      </div>
    ),
  },
  {
    id: "payment",
    header: () => "Pagamento",
    cell: ({ row }) => {
      const order = row.original
      const cfg = getStatusConfig(
        PAYMENT_STATUS_CONFIG,
        order.paymentStatus,
        "pending",
      )
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          {isOrderERPFailed(order) && (
            // Sits next to the payment-status badge so the row reads "Pago,
            // ERP falhou" at a glance — generic across providers (Tiny,
            // Bling, …) so the copy doesn't drift when more ERPs land.
            <Badge variant="destructive">Falha no ERP</Badge>
          )}
          {order.isFirstPurchase && (
            <Badge variant={FIRST_PURCHASE_BADGE.variant}>
              {FIRST_PURCHASE_BADGE.label}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "shipment",
    header: () => "Envio",
    cell: ({ row }) => (
      <ShipmentCell
        status={row.original.shipmentStatus}
        hasShipping={row.original.hasShipping}
      />
    ),
  },
  {
    id: "createdAt",
    header: ({ column }) => <SortHeader column={column}>Data</SortHeader>,
    enableSorting: true,
    meta: { sortKey: "created_at" },
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col leading-tight text-muted-foreground">
            <span>{formatDate(row.original.createdAt)}</span>
            <span className="text-xs text-muted-foreground/80">
              {formatRelativeTime(row.original.createdAt)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {formatDate(row.original.createdAt)} {formatTime(row.original.createdAt)}
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/orders/${row.original.id}`}>Ver detalhes</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

interface SortHeaderProps {
  column: Column<Order, unknown>
  align?: "left" | "right"
  children: React.ReactNode
}

function SortHeader({ column, align = "left", children }: SortHeaderProps) {
  const ctx = use(OrderListContext)
  if (!ctx) return <span>{children}</span>
  const sortKey = column.columnDef.meta?.sortKey ?? column.id
  const isActive = ctx.state.sorting.sortBy === sortKey
  const Icon = !isActive
    ? ArrowUpDown
    : ctx.state.sorting.sortOrder === "asc"
      ? ArrowUp
      : ArrowDown
  return (
    <button
      type="button"
      onClick={() => ctx.actions.toggleSort(sortKey)}
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

interface ShipmentCellProps {
  status: Order["shipmentStatus"]
  hasShipping: boolean
}

// Three states: shipment created (status badge from carrier), buyer chose a
// shipping service but no shipment row yet (generic "Aguardando emissão"),
// or buyer never picked anything (muted "Sem envio").
function ShipmentCell({ status, hasShipping }: ShipmentCellProps) {
  if (status) {
    const bucket = shipmentStatusBucket(status)
    return (
      <Badge variant={SHIPMENT_BUCKET_BADGE[bucket]} className="gap-1">
        {shipmentStatusLabel(status)}
      </Badge>
    )
  }
  if (hasShipping) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        Aguardando emissão
      </Badge>
    )
  }
  return <span className="text-xs text-muted-foreground">Sem envio</span>
}

interface ProductsPreviewProps {
  items: OrderItemPreview[]
  totalItems: number
}

const MAX_THUMBS = 3

function ProductsPreview({ items, totalItems }: ProductsPreviewProps) {
  if (items.length === 0) {
    return <span className="text-xs text-muted-foreground">{totalItems}</span>
  }
  const visible = items.slice(0, MAX_THUMBS)
  const remaining = Math.max(0, items.length - MAX_THUMBS)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {visible.map((item, i) => (
              <div
                key={`${item.productName}-${i}`}
                className="relative h-8 w-8 overflow-hidden rounded-md bg-muted shadow-sm ring-2 ring-background"
              >
                {item.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
            {remaining > 0 && (
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-muted text-[10px] font-semibold tabular-nums text-muted-foreground shadow-sm ring-2 ring-background">
                +{remaining}
              </div>
            )}
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {totalItems}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <ul className="flex flex-col gap-1 text-xs">
          {items.map((item, i) => (
            <li
              key={`tt-${i}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="truncate">{item.productName}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                ×{item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}
