"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Box,
  Calendar,
  Expand,
  Hash,
  Package,
  RefreshCw,
  Ruler,
  Scale,
  Shield,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ImageLightbox } from "@/components/shared/ImageLightbox"
import { useProductOrderBreakdown } from "@/hooks/order"
import {
  formatCurrency,
  formatDateTime,
  formatDimensions,
  formatWeight,
} from "@/lib/format"
import type { Product } from "@/types/product.types"
import type { ProductOrderBreakdownBucket } from "@/types"

const packageFormatLabels: Record<string, string> = {
  box: "Caixa",
  roll: "Rolo / tubo",
  letter: "Envelope",
}

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSync?: (product: Product) => void
  isSyncing?: boolean
  canSync?: boolean
}

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  bling: "Bling",
  tiny: "Tiny",
  shopify: "Shopify",
}

const sourceColors: Record<string, string> = {
  manual: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  bling: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  tiny: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  shopify: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

function getProductInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onSync,
  isSyncing = false,
  canSync = false,
}: ProductDetailModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!product) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* p-0 + max-h com scroll INTERNO: o Dialog centraliza na vertical e,
            sem teto de altura, um conteúdo maior que a viewport corta topo e
            rodapé ao mesmo tempo — exatamente o que acontecia em notebook. */}
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <div className="max-h-[85dvh] overflow-y-auto overscroll-contain">
            {/* Cabeçalho compacto: miniatura + identidade + preço. O hero de
                256px de altura era 1/3 de uma tela de notebook só de foto —
                a miniatura clicável mantém o zoom sem cobrar essa altura. */}
            <div className="flex items-start gap-4 p-5 pb-4">
              <ProductThumb
                product={product}
                onZoom={() => setLightboxOpen(true)}
              />
              <div className="min-w-0 flex-1">
                <DialogHeader className="space-y-0">
                  <div className="flex items-start justify-between gap-3">
                    <DialogTitle className="truncate text-xl font-semibold tracking-tight">
                      {product.name}
                    </DialogTitle>
                    {canSync && onSync && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSync(product)}
                        disabled={isSyncing}
                        className="shrink-0 gap-2"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Sincronizando..." : "Sincronizar"}
                      </Button>
                    )}
                  </div>
                </DialogHeader>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      product.shippable
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
                    }
                  >
                    {product.shippable ? "Cotável" : "Faltam medidas"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={sourceColors[product.externalSource] ?? ""}
                  >
                    {sourceLabels[product.externalSource] ??
                      product.externalSource}
                  </Badge>
                </div>
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-2xl font-bold tabular-nums tracking-tight">
                    {formatCurrency(product.price)}
                  </span>
                  <span
                    className={`text-sm ${
                      product.stock <= 5
                        ? "font-medium text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {product.stock === 0
                      ? "estoque esgotado"
                      : `${product.stock} em estoque${product.stock <= 5 ? " (baixo)" : ""}`}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* A rastreabilidade pedida pelo cliente (20/08/2026): a partir do
                produto, quais pedidos o contêm — por status. */}
            <OrdersSection product={product} />

            <Separator />

            <div className="p-5 pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Keyword"
                  value={
                    <span className="font-mono text-sm">{product.keyword}</span>
                  }
                />
                {product.externalId && (
                  <InfoItem
                    icon={<Hash className="h-4 w-4" />}
                    label="ID Externo"
                    value={
                      <span className="font-mono text-sm">
                        {product.externalId}
                      </span>
                    }
                  />
                )}
              </div>

              <Separator className="my-4" />

              <ShippingSection product={product} />

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Criado em {formatDateTime(product.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  <span>Atualizado em {formatDateTime(product.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {product.imageUrl && (
        <ImageLightbox
          src={product.imageUrl}
          alt={product.name}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  )
}

function ProductThumb({
  product,
  onZoom,
}: {
  product: Product
  onZoom: () => void
}) {
  if (!product.imageUrl) {
    return (
      <Avatar className="h-24 w-24 shrink-0 rounded-xl border">
        <AvatarFallback className="rounded-xl text-2xl font-semibold text-muted-foreground">
          {getProductInitials(product.name)}
        </AvatarFallback>
      </Avatar>
    )
  }
  return (
    <button
      type="button"
      onClick={onZoom}
      aria-label="Ampliar imagem"
      className="group relative h-24 w-24 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="96px"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
        <Expand className="h-5 w-5 text-white" />
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pedidos com este produto
// ─────────────────────────────────────────────────────────────────────────────

interface OrderStatusBucket {
  key: string
  label: string
  accent: string
  orders: number
  units: number
}

/** Dobra os pares crus (status × payment_status) nos rótulos que o lojista
 *  usa. A ordem dos testes importa: pago vence tudo; reembolsado vem antes de
 *  cancelado porque o estorno também cancela o carrinho. */
function foldBuckets(raw: ProductOrderBreakdownBucket[]): OrderStatusBucket[] {
  const folded: Record<string, OrderStatusBucket> = {
    paid: { key: "paid", label: "Pagos", accent: "border-l-emerald-500", orders: 0, units: 0 },
    awaiting: { key: "awaiting", label: "Aguardando pagamento", accent: "border-l-amber-500", orders: 0, units: 0 },
    failed: { key: "failed", label: "Pagamento falhou", accent: "border-l-destructive", orders: 0, units: 0 },
    refunded: { key: "refunded", label: "Reembolsados", accent: "border-l-rose-400", orders: 0, units: 0 },
    expired: { key: "expired", label: "Expirados", accent: "border-l-muted-foreground/40", orders: 0, units: 0 },
    cancelled: { key: "cancelled", label: "Cancelados", accent: "border-l-muted-foreground/40", orders: 0, units: 0 },
  }
  for (const b of raw) {
    const target =
      b.paymentStatus === "paid"
        ? folded.paid
        : b.paymentStatus === "refunded"
          ? folded.refunded
          : b.status === "expired"
            ? folded.expired
            : b.status === "cancelled"
              ? folded.cancelled
              : b.paymentStatus === "failed"
                ? folded.failed
                : folded.awaiting
    target.orders += b.orders
    target.units += b.units
  }
  return Object.values(folded).filter((b) => b.orders > 0)
}

function OrdersSection({ product }: { product: Product }) {
  const { data, isLoading } = useProductOrderBreakdown(product.id)
  const buckets = data ? foldBuckets(data.buckets) : []
  const totalOrders = buckets.reduce((acc, b) => acc + b.orders, 0)

  return (
    <div className="p-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Pedidos com este produto</h3>
          {!isLoading && totalOrders > 0 && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {totalOrders}
            </span>
          )}
        </div>
        {totalOrders > 0 && (
          <Button asChild variant="ghost" size="sm" className="-mr-2 gap-1.5">
            <Link href={`/orders?product=${product.id}`}>
              Ver pedidos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Skeleton className="h-[72px] rounded-lg" />
          <Skeleton className="h-[72px] rounded-lg" />
          <Skeleton className="h-[72px] rounded-lg" />
        </div>
      ) : totalOrders === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nenhum pedido com este produto ainda — ele aparece aqui assim que
          alguém pedir na live.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {buckets.map((b) => (
            <div
              key={b.key}
              className={`rounded-lg border border-l-2 px-3 py-2.5 ${b.accent}`}
            >
              <p className="text-xl font-semibold leading-tight tabular-nums">
                {b.orders}
              </p>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {b.label}
              </p>
              <p className="text-xs tabular-nums text-muted-foreground/80">
                {b.units} {b.units === 1 ? "unidade" : "unidades"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ShippingSection({ product }: { product: Product }) {
  const s = product.shipping
  const hasDims =
    s.weightGrams !== null &&
    s.heightCm !== null &&
    s.widthCm !== null &&
    s.lengthCm !== null

  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center gap-2">
        <Truck className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Dados para frete</h3>
      </div>

      {!hasDims ? (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Nenhuma medida cadastrada. Edite o produto para habilitar cotação
          automática no checkout.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoItem
            icon={<Scale className="h-4 w-4" />}
            label="Peso"
            value={
              <span className="font-medium">
                {formatWeight(s.weightGrams!)}
              </span>
            }
          />
          <InfoItem
            icon={<Ruler className="h-4 w-4" />}
            label="Dimensões"
            value={
              <span className="font-medium">
                {formatDimensions(s.heightCm!, s.widthCm!, s.lengthCm!)}
              </span>
            }
          />
          <InfoItem
            icon={<Box className="h-4 w-4" />}
            label="Formato"
            value={
              <span className="font-medium">
                {packageFormatLabels[s.packageFormat] ?? s.packageFormat}
              </span>
            }
          />
          {s.sku && (
            <InfoItem
              icon={<Hash className="h-4 w-4" />}
              label="SKU"
              value={<span className="font-mono text-sm">{s.sku}</span>}
            />
          )}
          {s.insuranceValueCents !== null && (
            <InfoItem
              icon={<Shield className="h-4 w-4" />}
              label="Valor declarado"
              value={
                <span className="font-medium">
                  {formatCurrency(s.insuranceValueCents)}
                </span>
              }
            />
          )}
        </div>
      )}
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div>{value}</div>
      </div>
    </div>
  )
}
