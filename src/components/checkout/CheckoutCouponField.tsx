"use client"

import { useState } from "react"
import { Tag, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AppliedCoupon {
  code: string
  discountAmount: number
  discountType: "percentage" | "fixed"
  discountValue: number
}

interface CheckoutCouponFieldProps {
  onApplyCoupon: (code: string) => Promise<AppliedCoupon | null>
  onRemoveCoupon: () => void
  appliedCoupon?: AppliedCoupon | null
  disabled?: boolean
  className?: string
}

export function CheckoutCouponField({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  disabled = false,
  className,
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
        setError("Cupom inválido ou expirado")
      } else {
        setCode("")
      }
    } catch {
      setError("Erro ao aplicar cupom")
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

  // Show applied coupon
  if (appliedCoupon) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-600">
                {appliedCoupon.discountType === "percentage"
                  ? `${appliedCoupon.discountValue}% de desconto`
                  : `R$ ${(appliedCoupon.discountValue / 100).toFixed(2)} de desconto`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="h-8 w-8 p-0 text-green-700 hover:bg-green-100 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Código do cupom"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={disabled || isLoading || !code.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
