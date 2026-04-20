"use client"

import { cn } from "@/lib/utils"
import type { IntegrationProvider } from "@/types"

interface IntegrationCardLogoProps {
  provider: IntegrationProvider
  size?: "sm" | "md" | "lg"
  className?: string
}

// Brand colors
const brandColors: Record<IntegrationProvider, { bg: string; text: string }> = {
  mercado_pago: { bg: "bg-[#009EE3]/10", text: "text-[#009EE3]" },
  pagarme: { bg: "bg-[#65A300]/10", text: "text-[#65A300]" },
  tiny: { bg: "bg-[#FF6B35]/10", text: "text-[#FF6B35]" },
  instagram: { bg: "bg-gradient-to-br from-[#833AB4]/10 via-[#E1306C]/10 to-[#F77737]/10", text: "text-[#E1306C]" },
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
}

const iconSizes = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

// Custom SVG logos for each provider
function MercadoPagoLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PagarmeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
    </svg>
  )
}

function TinyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 6h2v4h-2v-4z" />
    </svg>
  )
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

const logos: Record<IntegrationProvider, React.FC<{ className?: string }>> = {
  mercado_pago: MercadoPagoLogo,
  pagarme: PagarmeLogo,
  tiny: TinyLogo,
  instagram: InstagramLogo,
}

export function IntegrationCardLogo({ provider, size = "md", className }: IntegrationCardLogoProps) {
  const colors = brandColors[provider]
  const Logo = logos[provider]

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
        colors.bg,
        sizes[size],
        className
      )}
    >
      <Logo className={cn(colors.text, iconSizes[size])} />
    </div>
  )
}
