"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ShoppingBag, ChevronDown, Plus, Minus, Trash2, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckoutCouponField } from "./CheckoutCouponField"
import { CheckoutTrustBadges } from "./CheckoutTrustBadges"
import { CheckoutExpirationTimer } from "./CheckoutExpirationTimer"
import { cn } from "@/lib/utils"

interface OrderItem {
  id: string
  name: string
  imageUrl?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  /** Stock available for this SKU; combined with maxQuantityPerItem to gate
   *  the "+" button. Undefined means stock is unconstrained (legacy data). */
  availableStock?: number
}

import type { AppliedCoupon } from "@/types"

interface CheckoutOrderSummaryProps {
  items: OrderItem[]
  subtotal: number
  totalItems: number
  /**
   * Shipping cost in cents. `null` = not selected yet (shows "A calcular"),
   * 0 = free (shows "Grátis").
   */
  shippingCostCents?: number | null
  /**
   * Real shipping cost in cents, displayed crossed out when the charged
   * cost is 0 due to an event-level free shipping override.
   */
  shippingRealCostCents?: number | null
  /**
   * Whether the event is flagged as free shipping. Controls the
   * "Frete grátis aplicado pelo evento" note.
   */
  isFreeShipping?: boolean
  discount?: number
  /**
   * Configured Pix discount percent (0-100). Surfaced only as a hint when no
   * Pix has been chosen yet so the buyer understands they could save.
   */
  pixDiscountPercent?: number
  /**
   * Absolute Pix discount in cents that *would* apply if the buyer chose Pix.
   * The summary renders it as a green "−R$ X,XX (Pix)" line when applied.
   */
  pixDiscountCents?: number
  /**
   * True when the buyer has selected Pix as the payment method. Drives the
   * actual subtraction from the displayed total.
   */
  pixDiscountApplied?: boolean
  total: number
  platformHandle?: string
  isLiveActive?: boolean
  allowEdit?: boolean
  maxQuantityPerItem?: number
  expiresAt?: string | null
  appliedCoupon?: AppliedCoupon | null
  onApplyCoupon?: (code: string) => Promise<AppliedCoupon | null>
  onRemoveCoupon?: () => Promise<void> | void
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  onExpired?: () => void
  formatCurrency: (cents: number) => string
  className?: string
}

// Premium item component with hover effects
function OrderItemCompact({
  item,
  formatCurrency,
  allowEdit,
  maxQuantityPerItem,
  isLastItem,
  onUpdateQuantity,
  onRemoveItem,
  index,
}: {
  item: OrderItem
  formatCurrency: (cents: number) => string
  allowEdit?: boolean
  maxQuantityPerItem?: number
  isLastItem?: boolean
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  index: number
}) {
  const [mounted, setMounted] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const cap = maxQuantityPerItem && maxQuantityPerItem > 0 ? maxQuantityPerItem : Infinity
  // availableStock = free units of the SKU at read time (BE: product.stock).
  // The buyer can grow to (current qty + free units); undefined means the SKU
  // doesn't track stock and is effectively unconstrained.
  const stockUnknown =
    item.availableStock === undefined || item.availableStock === null
  const freeUnits: number = stockUnknown ? Infinity : (item.availableStock ?? Infinity)
  const stockBound = item.quantity + freeUnits
  const effectiveLimit = Math.min(cap, stockBound)
  const canDecrease = item.quantity > 1
  const canIncrease = item.quantity < effectiveLimit
  const stockIsBinding = !canIncrease && stockBound <= cap

  // Stock-bound limits surprise buyers more than per-item caps, so when both
  // bite the stock message wins. freeUnits=0 = hard sold-out copy.
  const limitReason = !canIncrease
    ? stockIsBinding
      ? freeUnits === 0
        ? "Sem mais unidades disponíveis no estoque"
        : `Apenas ${item.availableStock} ${item.availableStock === 1 ? "unidade" : "unidades"} disponíveis`
      : `Limite de ${maxQuantityPerItem} por item`
    : null

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 50)
    return () => clearTimeout(timer)
  }, [index])

  const handleRemoveClick = () => {
    if (isLastItem) {
      setConfirmRemove(true)
      return
    }
    onRemoveItem?.(item.id)
  }

  return (
    <div
      className={cn(
        "group flex gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50",
        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      )}
    >
      {/* Image container with quantity badge */}
      <div className="relative flex-shrink-0">
        <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>
        {/* Quantity badge - always show when not using edit controls */}
        {!(allowEdit && onUpdateQuantity) && (
          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white shadow-md ring-2 ring-white">
            {item.quantity}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-xs text-gray-500">
          {formatCurrency(item.unitPrice)} cada
        </p>
      </div>

      {allowEdit && onUpdateQuantity ? (
        <div className="flex items-center gap-2">
          {/* Quantity controls with premium styling */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none hover:bg-gray-100"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={!canDecrease}
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">
              {item.quantity}
            </span>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Span wrapper keeps the tooltip mounted on a disabled button. */}
                  <span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none hover:bg-gray-100"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={!canIncrease}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {limitReason && (
                  <TooltipContent
                    className={cn(
                      stockIsBinding &&
                        "border-amber-200 bg-amber-50 text-amber-900",
                    )}
                  >
                    {limitReason}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Remove button (with last-item confirmation guard) */}
          {onRemoveItem && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={handleRemoveClick}
                aria-label="Remover item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Esvaziar carrinho?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Removendo este item seu carrinho ficará vazio e você não
                      conseguirá finalizar a compra.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setConfirmRemove(false)
                        onRemoveItem(item.id)
                      }}
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      ) : (
        <p className="text-sm font-semibold text-gray-900 self-center tabular-nums">
          {formatCurrency(item.totalPrice)}
        </p>
      )}
    </div>
  )
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  totalItems,
  shippingCostCents = null,
  shippingRealCostCents = null,
  isFreeShipping = false,
  discount = 0,
  pixDiscountPercent = 0,
  pixDiscountCents = 0,
  pixDiscountApplied = false,
  total,
  platformHandle,
  isLiveActive,
  allowEdit,
  maxQuantityPerItem,
  expiresAt,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onUpdateQuantity,
  onRemoveItem,
  onExpired,
  formatCurrency,
  className,
}: CheckoutOrderSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shippingPending = shippingCostCents === null
  const shippingFreeNow = shippingCostCents === 0

  // Shared content as a JSX variable so it's reused (not re-declared as a
  // component on every render, which would remount children — and flicker
  // product images — on every parent keystroke).
  const summaryContent = (
    <div className="space-y-4">
      {/* Expiration timer - only show when live is NOT active */}
      {expiresAt && !isLiveActive && (
        <CheckoutExpirationTimer
          expiresAt={expiresAt}
          onExpired={onExpired}
        />
      )}

      {/* Live notice with pulse */}
      {isLiveActive && (
        <div className="relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-200/50" />
          <p className="relative text-sm text-orange-800">
            <span className="font-semibold">Live em andamento!</span>
            <br />
            <span className="text-orange-600">Novos itens podem ser adicionados.</span>
          </p>
        </div>
      )}

      {/* Coupon field */}
      {onApplyCoupon && onRemoveCoupon && (
        <CheckoutCouponField
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
          appliedCoupon={appliedCoupon}
          selectedShippingCents={shippingCostCents}
          formatCurrency={formatCurrency}
        />
      )}

      <Separator className="bg-gray-100" />

      {/* Items list */}
      <div className="space-y-1">
        {items.map((item, index) => (
          <OrderItemCompact
            key={item.id}
            item={item}
            index={index}
            formatCurrency={formatCurrency}
            allowEdit={allowEdit}
            maxQuantityPerItem={maxQuantityPerItem}
            isLastItem={items.length === 1}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      <Separator className="bg-gray-100" />

      {/* Summary with refined styling */}
      <div className="space-y-3 rounded-xl bg-gray-50/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"})
          </span>
          <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Desconto</span>
            <span className="font-medium text-emerald-600">-{formatCurrency(discount)}</span>
          </div>
        )}

        {pixDiscountApplied && pixDiscountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Desconto Pix
              {pixDiscountPercent > 0 && (
                <span className="ml-1 text-xs text-gray-400">
                  ({pixDiscountPercent}%)
                </span>
              )}
            </span>
            <span className="font-medium text-emerald-600">
              -{formatCurrency(pixDiscountCents)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Frete</span>
          {shippingPending ? (
            <span className="text-sm text-gray-500">A calcular</span>
          ) : shippingFreeNow ? (
            <span className="flex items-baseline gap-1.5 font-medium">
              {isFreeShipping &&
                shippingRealCostCents !== null &&
                shippingRealCostCents > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatCurrency(shippingRealCostCents)}
                  </span>
                )}
              <span className="text-emerald-600">Grátis</span>
            </span>
          ) : (
            <span className="font-medium text-gray-700">
              {formatCurrency(shippingCostCents!)}
            </span>
          )}
        </div>

        {isFreeShipping && shippingFreeNow && (
          <p className="text-xs text-emerald-600">
            Frete grátis aplicado pelo evento
          </p>
        )}

        <Separator className="bg-gray-200" />

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
        </div>

        {!pixDiscountApplied && pixDiscountPercent > 0 && pixDiscountCents > 0 && (
          <p className="text-xs text-emerald-600">
            Pague com Pix e ganhe {pixDiscountPercent}% de desconto (
            -{formatCurrency(pixDiscountCents)}).
          </p>
        )}
      </div>

      {/* User info */}
      {platformHandle && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
            {platformHandle.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-gray-600">
            Comprando como <span className="font-medium text-gray-900">@{platformHandle}</span>
          </p>
        </div>
      )}

      {/* Max quantity info */}
      {allowEdit && maxQuantityPerItem && maxQuantityPerItem > 0 && (
        <p className="text-xs text-center text-gray-600">
          Limite de {maxQuantityPerItem} unidades por item
        </p>
      )}

      {/* Trust badges */}
      <CheckoutTrustBadges className="pt-2" />
    </div>
  )

  return (
    <div className={className}>
      {/* Mobile collapsible version */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="lg:hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-xl border bg-white px-4 py-4 shadow-sm transition-all duration-300",
              isOpen ? "border-gray-300 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-md",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-gray-900">
                  Ver pedido
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({totalItems} {totalItems === 1 ? "item" : "itens"})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-transform duration-300",
                isOpen && "rotate-180"
              )}>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {summaryContent}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Desktop sticky version */}
      <Card
        className={cn(
          "hidden lg:block border-gray-100 shadow-lg shadow-gray-100/50 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Resumo do Pedido
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">{summaryContent}</CardContent>
      </Card>
    </div>
  )
}
