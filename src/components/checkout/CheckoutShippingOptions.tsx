"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
} from "react"
import Image from "next/image"
import { AlertCircle, Check, ChevronDown, Loader2, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { resolveCarrierLogo } from "@/lib/carriers"
import { cn } from "@/lib/utils"
import type { ShippingOption } from "@/types"

const PROVIDER_LABELS: Record<string, string> = {
  melhor_envio: "Melhor Envio",
  smartenvios: "SmartEnvios",
}

function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider
}

const VISIBLE_COUNT = 4
// α=0.6 favors price over ETA. Heuristic for BR e-commerce — price moves the
// needle harder than a one-day delivery delta.
const PRICE_WEIGHT = 0.6
const ETA_WEIGHT = 1 - PRICE_WEIGHT

type Reason = "cheapest" | "fastest" | "best"

const REASON_LABEL: Record<Reason, string> = {
  cheapest: "Mais barato",
  fastest: "Mais rápido",
  best: "Recomendado",
}

interface RankResult {
  visible: ShippingOption[]
  hidden: ShippingOption[]
  badgeId: string | null
  badgeReason: Reason | null
  serviceNameCounts: Record<string, number>
}

function rankOptions(options: ShippingOption[]): RankResult {
  const available = options.filter((o) => o.available)
  const unavailable = options.filter((o) => !o.available)

  if (available.length === 0) {
    return {
      visible: unavailable,
      hidden: [],
      badgeId: null,
      badgeReason: null,
      serviceNameCounts: countServiceNames(options),
    }
  }

  const prices = available.map((o) => o.priceCents)
  const etas = available.map((o) => o.deadlineDays)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const minE = Math.min(...etas)
  const maxE = Math.max(...etas)

  const score = (o: ShippingOption) =>
    PRICE_WEIGHT * ((o.priceCents - minP) / (maxP - minP || 1)) +
    ETA_WEIGHT * ((o.deadlineDays - minE) / (maxE - minE || 1))

  const sorted = [...available].sort((a, b) => score(a) - score(b))

  const top = sorted[0]
  const reason: Reason =
    top.priceCents === minP
      ? "cheapest"
      : top.deadlineDays === minE
        ? "fastest"
        : "best"

  // Unavailable carriers always sink to the bottom of the collapsed group so
  // they don't waste premium real estate but remain inspectable.
  const visible = sorted.slice(0, VISIBLE_COUNT)
  const hidden = [...sorted.slice(VISIBLE_COUNT), ...unavailable]

  return {
    visible,
    hidden,
    badgeId: top.id,
    badgeReason: reason,
    serviceNameCounts: countServiceNames(options),
  }
}

function countServiceNames(options: ShippingOption[]): Record<string, number> {
  return options.reduce<Record<string, number>>((acc, o) => {
    acc[o.service] = (acc[o.service] ?? 0) + 1
    return acc
  }, {})
}

interface ShippingOptionsContextValue {
  expanded: boolean
  toggle: () => void
  hiddenCount: number
}

const ShippingOptionsContext =
  createContext<ShippingOptionsContextValue | null>(null)

function useShippingOptionsContext() {
  const ctx = useContext(ShippingOptionsContext)
  if (!ctx) {
    throw new Error(
      "ShippingOptions.MoreToggle must render inside <ShippingOptions>"
    )
  }
  return ctx
}

interface CheckoutShippingOptionsProps {
  options: ShippingOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading: boolean
  isSelecting: boolean
  selectingId?: string | null
  error: string | null
  onRetry: () => void
  freeShipping: boolean
  formatCurrency: (cents: number) => string
}

function ShippingOptionsRoot({
  options,
  selectedId,
  onSelect,
  isLoading,
  isSelecting,
  selectingId,
  error,
  onRetry,
  freeShipping,
  formatCurrency,
}: CheckoutShippingOptionsProps) {
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded((v) => !v), [])

  const ranked = useMemo(() => rankOptions(options), [options])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 p-6 text-center">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-red-700">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center">
        <Truck className="h-6 w-6 text-gray-400" />
        <p className="text-sm text-gray-600">
          Não encontramos transportadoras atendendo esse CEP. Verifique se o CEP
          está correto ou entre em contato com a loja.
        </p>
      </div>
    )
  }

  const { visible, hidden, badgeId, badgeReason, serviceNameCounts } = ranked
  const hasMore = hidden.length > 0

  const renderRow = (option: ShippingOption) => (
    <ShippingOptionsRow
      key={`${option.provider}:${option.id}`}
      option={option}
      selected={selectedId === option.id}
      selecting={isSelecting && selectingId === option.id}
      disabled={isSelecting}
      freeShipping={freeShipping}
      onSelect={() => onSelect(option.id)}
      formatCurrency={formatCurrency}
      showProviderBadge={(serviceNameCounts[option.service] ?? 0) > 1}
      badgeLabel={
        badgeId === option.id && badgeReason ? REASON_LABEL[badgeReason] : null
      }
    />
  )

  return (
    <ShippingOptionsContext.Provider
      value={{ expanded, toggle, hiddenCount: hidden.length }}
    >
      <div className="space-y-3">
        {visible.map(renderRow)}
      </div>

      {hasMore && (
        <>
          <div className="mt-1 flex justify-center">
            <ShippingOptionsMoreToggle />
          </div>

          <div
            data-open={expanded || undefined}
            className={cn(
              "group/list mt-1 grid grid-rows-[0fr]",
              "transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
              "data-[open]:grid-rows-[1fr]"
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 pt-1">
                {hidden.map((option, i) => (
                  <div
                    key={`${option.provider}:${option.id}`}
                    style={{ "--i": i } as CSSProperties}
                    className={cn(
                      "translate-y-1 opacity-0 transition-[opacity,transform] duration-200 ease-out",
                      "[transition-delay:calc(var(--i)*30ms)]",
                      "group-data-[open]/list:translate-y-0 group-data-[open]/list:opacity-100"
                    )}
                  >
                    {renderRow(option)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </ShippingOptionsContext.Provider>
  )
}

function ShippingOptionsMoreToggle() {
  const { expanded, toggle, hiddenCount } = useShippingOptionsContext()
  return (
    <button
      type="button"
      onClick={toggle}
      data-open={expanded || undefined}
      aria-expanded={expanded}
      className={cn(
        "group/toggle inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5",
        "text-sm font-medium text-gray-600 transition-colors",
        "hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring/40 focus-visible:ring-offset-2"
      )}
    >
      {expanded ? "Ver menos" : `Ver mais ${hiddenCount} opções`}
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          "group-data-[open]/toggle:rotate-180"
        )}
      />
    </button>
  )
}

interface ShippingOptionsRowProps {
  option: ShippingOption
  selected: boolean
  selecting: boolean
  disabled: boolean
  freeShipping: boolean
  onSelect: () => void
  formatCurrency: (cents: number) => string
  showProviderBadge: boolean
  badgeLabel: string | null
}

function ShippingOptionsRow({
  option,
  selected,
  selecting,
  disabled,
  freeShipping,
  onSelect,
  formatCurrency,
  showProviderBadge,
  badgeLabel,
}: ShippingOptionsRowProps) {
  const unavailable = !option.available
  const isPickup = option.provider === "pickup"
  const chargedCents = option.priceCents
  const realCents = option.realPriceCents
  const logoSrc = isPickup
    ? null
    : resolveCarrierLogo(option.carrier, option.carrierLogoUrl)

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={unavailable || (disabled && !selected)}
      title={unavailable ? option.error || "Indisponível" : undefined}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition-all duration-200",
        selected
          ? "border-ring/60 shadow-sm ring-2 ring-ring ring-offset-2"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        unavailable &&
          "cursor-not-allowed opacity-60 hover:border-gray-200 hover:shadow-none",
        disabled && !selected && !unavailable && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={option.carrier}
            fill
            unoptimized
            className="object-contain p-1"
            sizes="40px"
          />
        ) : (
          <Truck className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-gray-900">
            {option.service}
          </span>
          {!isPickup && (
            <span className="text-xs text-gray-500">· {option.carrier}</span>
          )}
        </div>
        {unavailable ? (
          <p className="mt-0.5 text-xs text-red-500">
            {option.error || "Indisponível"}
          </p>
        ) : isPickup ? (
          <p className="mt-0.5 text-xs text-gray-500">
            Retire no endereço da loja
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-gray-500">
            chega em até{" "}
            <strong className="text-gray-700">{option.deadlineDays}</strong>{" "}
            {option.deadlineDays === 1 ? "dia útil" : "dias úteis"}
          </p>
        )}
        {showProviderBadge && (
          <p className="mt-0.5 text-[11px] text-gray-600">
            via {providerLabel(option.provider)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end">
        {badgeLabel && !unavailable && (
          <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
            {badgeLabel}
          </span>
        )}
        {unavailable ? (
          <span className="text-sm font-medium text-gray-500">—</span>
        ) : freeShipping && realCents > 0 ? (
          <>
            <span className="text-xs text-gray-500 line-through">
              {formatCurrency(realCents)}
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              Grátis
            </span>
          </>
        ) : chargedCents === 0 ? (
          <span className="text-sm font-semibold text-emerald-600">Grátis</span>
        ) : (
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {formatCurrency(chargedCents)}
          </span>
        )}
      </div>

      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
        {selecting ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : selected ? (
          <Check className="h-4 w-4 text-ring" />
        ) : null}
      </div>
    </button>
  )
}

interface CheckoutShippingOptionsCompound {
  (props: CheckoutShippingOptionsProps): React.ReactElement
  Row: typeof ShippingOptionsRow
  MoreToggle: typeof ShippingOptionsMoreToggle
}

export const CheckoutShippingOptions =
  ShippingOptionsRoot as unknown as CheckoutShippingOptionsCompound
CheckoutShippingOptions.Row = ShippingOptionsRow
CheckoutShippingOptions.MoreToggle = ShippingOptionsMoreToggle
