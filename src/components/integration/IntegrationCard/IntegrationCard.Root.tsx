"use client"

import { cn } from "@/lib/utils"
import type { IntegrationProvider } from "@/types"

export interface IntegrationCardRootProps {
  children: React.ReactNode
  provider: IntegrationProvider
  connected?: boolean
  className?: string
  onClick?: () => void
}

// Brand colors for each provider
const brandStyles: Record<IntegrationProvider, { gradient: string; ring: string; glow: string }> = {
  mercado_pago: {
    gradient: "from-[#009EE3] to-[#00B1EA]",
    ring: "ring-[#009EE3]/30",
    glow: "group-hover:shadow-[#009EE3]/20",
  },
  pagarme: {
    gradient: "from-[#65A300] to-[#7BC014]",
    ring: "ring-[#65A300]/30",
    glow: "group-hover:shadow-[#65A300]/20",
  },
  tiny: {
    gradient: "from-[#FF6B35] to-[#FF8C42]",
    ring: "ring-[#FF6B35]/30",
    glow: "group-hover:shadow-[#FF6B35]/20",
  },
  twilio_whatsapp: {
    gradient: "from-[#25D366] to-[#128C7E]",
    ring: "ring-[#25D366]/30",
    glow: "group-hover:shadow-[#25D366]/20",
  },
  instagram: {
    gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
    ring: "ring-[#E1306C]/30",
    glow: "group-hover:shadow-[#E1306C]/20",
  },
  melhor_envio: {
    gradient: "from-[#0FBF61] to-[#14D67A]",
    ring: "ring-[#0FBF61]/30",
    glow: "group-hover:shadow-[#0FBF61]/20",
  },
  smartenvios: {
    gradient: "from-[#1D4ED8] to-[#3B82F6]",
    ring: "ring-[#1D4ED8]/30",
    glow: "group-hover:shadow-[#1D4ED8]/20",
  },
}

export function IntegrationCardRoot({
  children,
  provider,
  connected = false,
  className,
  onClick,
}: IntegrationCardRootProps) {
  const brand = brandStyles[provider]

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-300",
        "hover:shadow-lg",
        brand.glow,
        connected && ["ring-2", brand.ring],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient accent on top */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r opacity-0 transition-opacity",
          brand.gradient,
          connected ? "opacity-100" : "group-hover:opacity-60"
        )}
      />
      {children}
    </div>
  )
}
