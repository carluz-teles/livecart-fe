"use client"

import { useState } from "react"
import { Tag, X, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getCouponErrorMessage } from "@/lib/coupon-errors"
import type { AppliedCoupon } from "@/types"

interface CheckoutCouponFieldProps {
  // Resolves with the applied coupon on success, throws an ApiError-shaped
  // object on failure so the field can surface the BE message inline.
  onApplyCoupon: (code: string) => Promise<AppliedCoupon | null>
  // Now async-aware so the field can lock the UI while the request roams.
  // Should reject (re-throw) on failure so the inline alert can render.
  onRemoveCoupon: () => Promise<void> | void
  appliedCoupon?: AppliedCoupon | null
  disabled?: boolean
  className?: string
  // Injected so the component stays decoupled from project-wide Intl helpers.
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
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isBusy = isApplying || isRemoving || disabled

  const handleApply = async () => {
    const trimmed = code.trim()
    if (!trimmed || isBusy) return

    setIsApplying(true)
    setError(null)

    try {
      const result = await onApplyCoupon(trimmed.toUpperCase())
      if (!result) {
        // Defensive: parent didn't throw but returned null. Treat as a
        // generic invalid code so the user sees feedback.
        setError("Cupom inválido ou expirado.")
      } else {
        setCode("")
      }
    } catch (err) {
      setError(getCouponErrorMessage(err))
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = async () => {
    if (isBusy) return

    setIsRemoving(true)
    setError(null)

    try {
      await onRemoveCoupon()
      setCode("")
    } catch (err) {
      setError(
        getCouponErrorMessage(
          err,
          "Não foi possível remover o cupom. Tente novamente.",
        ),
      )
    } finally {
      setIsRemoving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleApply()
    }
  }

  if (appliedCoupon) {
    return (
      <div className={cn("space-y-2", className)} aria-live="polite">
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border p-3 transition-opacity",
            "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30",
            isRemoving && "opacity-70",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm"
              aria-hidden="true"
            >
              <Check className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-mono font-semibold uppercase tracking-wide text-emerald-900 truncate dark:text-emerald-100"
                translate="no"
              >
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-emerald-700 tabular-nums dark:text-emerald-300">
                Desconto aplicado:{" "}
                <span className="font-semibold">
                  −{formatCurrency(appliedCoupon.discountCents)}
                </span>
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isBusy}
            aria-label={`Remover cupom ${appliedCoupon.code}`}
            className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 text-xs text-destructive"
          >
            <AlertCircle
              className="h-3.5 w-3.5 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </p>
        )}
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
              if (error) setError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            aria-invalid={!!error}
            aria-describedby={error ? "coupon-error" : undefined}
            className={cn(
              "pl-9 font-mono uppercase",
              error && "border-destructive focus-visible:ring-destructive",
            )}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={isBusy || !code.trim()}
          aria-busy={isApplying}
        >
          {isApplying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      {error && (
        <p
          id="coupon-error"
          role="alert"
          className="flex items-start gap-1.5 text-xs text-destructive"
        >
          <AlertCircle
            className="h-3.5 w-3.5 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
