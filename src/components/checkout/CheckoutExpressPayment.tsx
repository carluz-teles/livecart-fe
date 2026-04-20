"use client"

import { useState, useEffect } from "react"
import { Zap, CreditCard, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/types"

interface CheckoutExpressPaymentProps {
  onSelectMethod: (method: PaymentMethod) => void
  selectedMethod: PaymentMethod
  pixAvailable?: boolean
  cardAvailable?: boolean
  disabled?: boolean
}

export function CheckoutExpressPayment({
  onSelectMethod,
  selectedMethod,
  pixAvailable = true,
  cardAvailable = true,
  disabled = false,
}: CheckoutExpressPaymentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!pixAvailable && !cardAvailable) {
    return null
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-500">Escolha a forma de pagamento</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* PIX Option */}
        {pixAvailable && (
          <button
            type="button"
            onClick={() => onSelectMethod("pix")}
            disabled={disabled}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
              selectedMethod === "pix"
                ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-lg shadow-emerald-500/10"
                : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300",
                selectedMethod === "pix"
                  ? "bg-emerald-500 scale-100"
                  : "bg-gray-200 scale-90"
              )}
            >
              <Check
                className={cn(
                  "h-3 w-3 text-white transition-all duration-300",
                  selectedMethod === "pix" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
              />
            </div>

            {/* Decorative gradient */}
            <div
              className={cn(
                "absolute -right-8 -top-8 h-24 w-24 rounded-full transition-all duration-500",
                selectedMethod === "pix"
                  ? "bg-emerald-200/50"
                  : "bg-gray-100 opacity-0 group-hover:opacity-100"
              )}
            />

            <div className="relative">
              {/* Icon with glow */}
              <div
                className={cn(
                  "mb-3 inline-flex items-center justify-center rounded-lg p-2 transition-all duration-300",
                  selectedMethod === "pix"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                )}
              >
                <Zap className="h-5 w-5" />
              </div>

              {/* Text content */}
              <h3
                className={cn(
                  "font-semibold transition-colors duration-300",
                  selectedMethod === "pix" ? "text-emerald-900" : "text-gray-900"
                )}
              >
                PIX
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                Aprovação instantânea
              </p>

              {/* Discount badge */}
              <div
                className={cn(
                  "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-300",
                  selectedMethod === "pix"
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-emerald-100 text-emerald-700"
                )}
              >
                Recomendado
              </div>
            </div>
          </button>
        )}

        {/* Card Option */}
        {cardAvailable && (
          <button
            type="button"
            onClick={() => onSelectMethod("card")}
            disabled={disabled}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300",
              mounted ? "opacity-100 translate-y-0 delay-75" : "opacity-0 translate-y-2",
              selectedMethod === "card"
                ? "border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-lg shadow-gray-900/10"
                : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300",
                selectedMethod === "card"
                  ? "bg-gray-900 scale-100"
                  : "bg-gray-200 scale-90"
              )}
            >
              <Check
                className={cn(
                  "h-3 w-3 text-white transition-all duration-300",
                  selectedMethod === "card" ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
              />
            </div>

            {/* Decorative gradient */}
            <div
              className={cn(
                "absolute -right-8 -top-8 h-24 w-24 rounded-full transition-all duration-500",
                selectedMethod === "card"
                  ? "bg-gray-200/50"
                  : "bg-gray-100 opacity-0 group-hover:opacity-100"
              )}
            />

            <div className="relative">
              {/* Icon */}
              <div
                className={cn(
                  "mb-3 inline-flex items-center justify-center rounded-lg p-2 transition-all duration-300",
                  selectedMethod === "card"
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/30"
                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                )}
              >
                <CreditCard className="h-5 w-5" />
              </div>

              {/* Text content */}
              <h3
                className={cn(
                  "font-semibold transition-colors duration-300",
                  selectedMethod === "card" ? "text-gray-900" : "text-gray-900"
                )}
              >
                Cartão de Crédito
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                Parcele em até 12x
              </p>

              {/* Card brands hint */}
              <div className="mt-2 flex items-center gap-1">
                {["visa", "mastercard", "amex"].map((brand) => (
                  <div
                    key={brand}
                    className="h-4 w-6 rounded bg-gray-200"
                    title={brand}
                  />
                ))}
                <span className="text-xs text-gray-400">+</span>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
