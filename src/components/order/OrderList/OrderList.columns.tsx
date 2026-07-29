"use client"

import { use } from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  Clock,
  Facebook,
  Instagram,
  Package,
  type LucideIcon,
} from "lucide-react"
import type { Column, ColumnDef, RowData } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OrderListRowActions } from "./OrderList.RowActions"
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

// True when the post-payment ERP order creation rejected this paid cart
// and the merchant still has to retry. Authoritative signal off the cart
// lifecycle column — replaces an earlier 5-min "stuck" heuristic that
// kept firing on every paid order, including the ones that finalised
// successfully.
export function isOrderERPFailed(order: Order): boolean {
  return order.erpFinalisationStatus === "failed"
}

// Pedido que morreu: cancelado pela loja ou vencido sem pagamento. Não há mais
// nada a fazer com ele — a linha inteira é tratada como histórico (texto
// esmaecido) e ganha um selo explícito, porque sem isso um carrinho cancelado
// lê exatamente como um pedido vivo aguardando pagamento.
export function isOrderTerminal(order: Order): boolean {
  return order.status === "cancelled" || order.status === "expired"
}

// Selo do estado terminal. Ícone + palavra: quem não distingue as cores (ou
// está imprimindo em preto e branco) continua lendo o que aconteceu.
const TERMINAL_BADGE: Record<string, { label: string; Icon: LucideIcon; hint: string }> = {
  cancelled: {
    label: "Cancelado",
    Icon: Ban,
    hint: "Cancelado pela loja. O estoque voltou para o catálogo e o link do cliente não aceita mais pagamento.",
  },
  expired: {
    label: "Expirado",
    Icon: Clock,
    hint: "O prazo de pagamento acabou. O estoque voltou para o catálogo e o link do cliente não aceita mais pagamento.",
  },
}

export const orderColumns: ColumnDef<Order>[] = [
  {
    id: "shortId",
    header: ({ column }) => <SortHeader column={column}>Pedido</SortHeader>,
    enableSorting: true,
    meta: { sortKey: "short_id" },
    cell: ({ row }) => {
      const terminal = TERMINAL_BADGE[row.original.status]
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium tabular-nums">
            #{row.original.shortId}
          </span>
          {terminal && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  // O token --destructive puro fica em ~3.7:1 sobre o fundo
                  // claro e reprova no AA para 11px. red-700/red-100 dá ~6.3:1
                  // (e red-300/red-950 no escuro), mantendo a mesma leitura.
                  // Mesmo motivo pelo qual a tabela já usa emerald direto: o
                  // design system ainda não tem token semântico com contraste
                  // garantido para texto pequeno.
                  className="gap-1 border-transparent bg-red-100 px-1.5 py-0 text-[11px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  <terminal.Icon className="h-3 w-3" aria-hidden="true" />
                  {terminal.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[16rem] text-xs">
                {terminal.hint}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    },
  },
  {
    id: "customer",
    header: () => "Cliente",
    cell: ({ row }) => {
      const order = row.original
      const erpFailed = isOrderERPFailed(order)
      const PlatformIcon = PLATFORM_ICON[order.livePlatform] ?? null
      return (
        <div className="flex items-center gap-2">
          {erpFailed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Pagamento confirmado mas o pedido não foi enviado para o ERP. Abra para tentar novamente.
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
      // "Pendente" num pedido morto é mentira: ninguém está esperando esse
      // pagamento cair. Vira "Não pago", em tom neutro. Pago/estornado/falhou
      // continuam como estão — esses aconteceram de verdade.
      const isDeadPending =
        isOrderTerminal(order) &&
        (order.paymentStatus === "pending" || !order.paymentStatus)
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {isDeadPending ? (
            <Badge variant="outline" className="text-muted-foreground">
              Não pago
            </Badge>
          ) : (
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          )}
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
    cell: ({ row }) => <OrderListRowActions order={row.original} />,
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
