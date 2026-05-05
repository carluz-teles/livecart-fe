"use client"

import { useState } from "react"
import { Tag, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AppliedCoupon } from "@/types"

// formatCurrency comes in from the parent so this component stays decoupled
// from the project's Intl helpers — same pattern as the surrounding summary.
interface CheckoutCouponFieldProps {
  onApplyCoupon: (code: string) => Promise<AppliedCoupon | null>
  onRemoveCoupon: () => void
  appliedCoupon?: AppliedCoupon | null
  disabled?: boolean
  className?: string
  formatCurrency: (cents: number) => string
}

export function CheckoutCouponField({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  disabled = false,
  className,
  formatCurrency,
}: CheckoutCouponFieldProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await onApplyCoupon(code.trim().toUpperCase())
      if (!result) {
        // Parent didn't throw but returned null — generic fallback.
        setError("Cupom inválido ou expirado")
      } else {
        setCode("")
      }
    } catch (err) {
      // Surface the BE message (invalid / exhausted / expired / below
      // minimum) when present; otherwise fall back to a generic copy.
      const message =
        (err as { message?: string } | null)?.message ||
        "Erro ao aplicar cupom"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    onRemoveCoupon()
    setCode("")
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleApply()
    }
  }

  if (appliedCoupon) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500"
              aria-hidden="true"
            >
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p
                className="text-sm font-mono font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200"
                translate="no"
              >
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                −{formatCurrency(appliedCoupon.discountCents)} de desconto
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            aria-label={`Remover cupom ${appliedCoupon.code}`}
            className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Código do cupom"
            autoComplete="off"
            spellCheck={false}
            translate="no"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            className="pl-9 font-mono uppercase"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={disabled || isLoading || !code.trim()}
        >
          {isLoading ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
