"use client"

import Image from "next/image"
import { AlertCircle, Check, Loader2, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ShippingOption } from "@/types"

const PROVIDER_LABELS: Record<string, string> = {
  melhor_envio: "Melhor Envio",
  smartenvios: "SmartEnvios",
}

function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider
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

export function CheckoutShippingOptions({
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
        >
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

  // Disambiguate with a subtle "via X" badge only when two or more options
  // share the same service name (e.g. "PAC" from both providers). With a
  // unique name there's nothing to disambiguate, so we skip the extra chrome.
  const serviceNameCounts = options.reduce<Record<string, number>>((acc, o) => {
    acc[o.service] = (acc[o.service] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <ShippingOptionCard
          key={`${option.provider}:${option.id}`}
          option={option}
          selected={selectedId === option.id}
          selecting={isSelecting && selectingId === option.id}
          disabled={isSelecting}
          freeShipping={freeShipping}
          onSelect={() => onSelect(option.id)}
          formatCurrency={formatCurrency}
          showProviderBadge={(serviceNameCounts[option.service] ?? 0) > 1}
        />
      ))}
    </div>
  )
}

interface ShippingOptionCardProps {
  option: ShippingOption
  selected: boolean
  selecting: boolean
  disabled: boolean
  freeShipping: boolean
  onSelect: () => void
  formatCurrency: (cents: number) => string
  showProviderBadge: boolean
}

function ShippingOptionCard({
  option,
  selected,
  selecting,
  disabled,
  freeShipping,
  onSelect,
  formatCurrency,
  showProviderBadge,
}: ShippingOptionCardProps) {
  const unavailable = !option.available
  // priceCents is already 0 when the event applies free shipping; realPriceCents
  // keeps the authoritative value for the strikethrough.
  const chargedCents = option.priceCents
  const realCents = option.realPriceCents

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={unavailable || (disabled && !selected)}
      title={unavailable ? option.error || "Indisponível" : undefined}
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition-all duration-200",
        selected
          ? "border-gray-900 shadow-md ring-1 ring-gray-900"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        unavailable && "cursor-not-allowed opacity-60 hover:border-gray-200 hover:shadow-none",
        disabled && !selected && !unavailable && "cursor-not-allowed opacity-50"
      )}
      aria-pressed={selected}
    >
      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
        {option.carrierLogoUrl ? (
          <Image
            src={option.carrierLogoUrl}
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

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-gray-900">
            {option.service}
          </span>
          <span className="text-xs text-gray-500">· {option.carrier}</span>
        </div>
        {unavailable ? (
          <p className="mt-0.5 text-xs text-red-500">
            {option.error || "Indisponível"}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-gray-500">
            chega em até <strong className="text-gray-700">{option.deadlineDays}</strong>{" "}
            {option.deadlineDays === 1 ? "dia útil" : "dias úteis"}
          </p>
        )}
        {showProviderBadge && (
          <p className="mt-0.5 text-[11px] text-gray-400">
            via {providerLabel(option.provider)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end">
        {unavailable ? (
          <span className="text-sm font-medium text-gray-400">—</span>
        ) : freeShipping && realCents > 0 ? (
          <>
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(realCents)}
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              Grátis
            </span>
          </>
        ) : chargedCents === 0 ? (
          <span className="text-sm font-semibold text-emerald-600">
            Grátis
          </span>
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
          <Check className="h-4 w-4 text-gray-900" />
        ) : null}
      </div>
    </button>
  )
}
