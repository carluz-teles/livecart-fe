"use client"

import { use } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Facebook,
  Instagram,
  MoreHorizontal,
  Package,
  Truck,
} from "lucide-react"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
import {
  shipmentStatusBucket,
  shipmentStatusLabel,
} from "@/lib/shipment"
import { cn } from "@/lib/utils"
import type { Order, OrderItemPreview } from "@/types/cart.types"
import type { ShipmentStatusBucket } from "@/types/shipment.types"
import { OrderListContext } from "./OrderListContext"

const FIVE_MIN_MS = 5 * 60 * 1000

const PLATFORM_ICON: Record<string, typeof Instagram> = {
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

interface RowProps {
  order: Order
}

export function OrderListRow({ order }: RowProps) {
  const ctx = use(OrderListContext)
  if (!ctx) return null

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

  const PlatformIcon = PLATFORM_ICON[order.livePlatform] ?? null

  return (
    <TooltipProvider delayDuration={300}>
      <TableRow
        className={cn(
          "group/row cursor-pointer transition-colors duration-150 hover:bg-muted/40",
          // Stuck rows wear a 3px destructive bar inset on the left edge —
          // chosen over a tinted background so the signal reads clearly
          // without staining the entire row. Subtle bg amplifies the cue
          // on hover without competing with the bar.
          isStuck &&
            "bg-destructive/[0.025] shadow-[inset_3px_0_0_0_hsl(var(--destructive))] hover:bg-destructive/[0.05]",
        )}
        onClick={() => ctx.actions.openOrder(order.id)}
        data-state={isStuck ? "stuck" : undefined}
      >
        <TableCell className="font-mono text-sm font-medium tabular-nums">
          #{order.shortId}
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            {isStuck && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Pago há mais de 5 minutos sem completar — verifique a integração com o ERP.
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex flex-col">
              <span className="font-medium leading-tight">
                {order.customerName || `@${order.customerHandle}`}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground leading-tight">
                {PlatformIcon && (
                  <PlatformIcon className="h-3 w-3" aria-hidden="true" />
                )}
                @{order.customerHandle}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell className="text-muted-foreground">
          {order.liveTitle || "Sem título"}
        </TableCell>

        <TableCell>
          <ProductsPreview items={order.itemsPreview} totalItems={order.totalItems} />
        </TableCell>

        <TableCell className="text-right">
          <div className="flex flex-col items-end leading-tight">
            <span className="font-medium tabular-nums">
              {formatCurrency(order.totalAmount)}
            </span>
            {order.freeShipping && (
              <span className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Frete grátis
              </span>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
            {order.isFirstPurchase && (
              <Badge variant={FIRST_PURCHASE_BADGE.variant}>
                {FIRST_PURCHASE_BADGE.label}
              </Badge>
            )}
          </div>
        </TableCell>

        <TableCell>
          <ShipmentCell status={order.shipmentStatus} />
        </TableCell>

        <TableCell className="text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col leading-tight">
                <span>{formatDate(order.createdAt)}</span>
                <span className="text-xs text-muted-foreground/80">
                  {formatRelativeTime(order.createdAt)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {formatDate(order.createdAt)} {formatTime(order.createdAt)}
            </TooltipContent>
          </Tooltip>
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
    </TooltipProvider>
  )
}

interface ShipmentCellProps {
  status: Order["shipmentStatus"]
}

function ShipmentCell({ status }: ShipmentCellProps) {
  if (!status) {
    return (
      <span className="text-xs text-muted-foreground">Sem envio</span>
    )
  }
  const bucket = shipmentStatusBucket(status)
  return (
    <Badge variant={SHIPMENT_BUCKET_BADGE[bucket]} className="gap-1">
      <Truck className="h-3 w-3" aria-hidden="true" />
      {shipmentStatusLabel(status)}
    </Badge>
  )
}

interface ProductsPreviewProps {
  items: OrderItemPreview[]
  totalItems: number
}

const MAX_THUMBS = 3

function ProductsPreview({ items, totalItems }: ProductsPreviewProps) {
  if (items.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">{totalItems}</span>
    )
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
            <li key={`tt-${i}`} className="flex items-center justify-between gap-3">
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
