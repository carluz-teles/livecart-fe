"use client"

import { cn } from "@/lib/utils"

export interface NotificationCardRootProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
  active?: boolean
}

// All notification cards share the Instagram channel for now, so the accent
// stripe at the top of the card uses Instagram's brand gradient.
const STRIPE_GRADIENT = "from-[#833AB4] via-[#E1306C] to-[#F77737]"

export function NotificationCardRoot({
  children,
  className,
  onClick,
  active = false,
}: NotificationCardRootProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-300",
        "hover:shadow-lg",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r transition-opacity",
          STRIPE_GRADIENT,
          active ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        )}
      />
      {children}
    </div>
  )
}
