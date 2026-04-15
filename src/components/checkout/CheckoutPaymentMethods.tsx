"use client"

import { CreditCard, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/types"

interface CheckoutPaymentMethodsProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  availableMethods: PaymentMethod[]
  disabled?: boolean
}

const methodConfig: Record<PaymentMethod, { icon: typeof CreditCard; label: string; description: string }> = {
  card: {
    icon: CreditCard,
    label: "Cartão de Crédito",
    description: "Pague em até 12x",
  },
  pix: {
    icon: QrCode,
    label: "PIX",
    description: "Pagamento instantâneo",
  },
}

export function CheckoutPaymentMethods({
  selectedMethod,
  onMethodChange,
  availableMethods,
  disabled = false,
}: CheckoutPaymentMethodsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Forma de Pagamento</h3>
      <div className="grid grid-cols-2 gap-3">
        {availableMethods.map((method) => {
          const config = methodConfig[method]
          const Icon = config.icon
          const isSelected = selectedMethod === method

          return (
            <button
              key={method}
              type="button"
              disabled={disabled}
              onClick={() => onMethodChange(method)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              )}
            >
              <Icon className={cn(
                "h-6 w-6",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-center">
                <p className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : ""
                )}>
                  {config.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
