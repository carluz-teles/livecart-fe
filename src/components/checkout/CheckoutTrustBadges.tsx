"use client"

import { Lock, ShieldCheck, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutTrustBadgesProps {
  className?: string
  variant?: "horizontal" | "vertical"
}

export function CheckoutTrustBadges({
  className,
  variant = "horizontal",
}: CheckoutTrustBadgesProps) {
  const badges = [
    {
      icon: Lock,
      label: "SSL Seguro",
    },
    {
      icon: ShieldCheck,
      label: "Dados protegidos",
    },
    {
      icon: CreditCard,
      label: "Pagamento seguro",
    },
  ]

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        variant === "vertical" && "flex-col gap-2",
        className
      )}
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <badge.icon className="h-3.5 w-3.5" />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
