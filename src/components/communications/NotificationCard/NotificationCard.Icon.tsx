"use client"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface NotificationCardIconProps {
  Icon: LucideIcon
  className?: string
}

export function NotificationCardIcon({ Icon, className }: NotificationCardIconProps) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent transition-transform group-hover:scale-105",
        className,
      )}
    >
      <Icon className="h-5 w-5 text-accent-foreground" strokeWidth={1.8} />
    </div>
  )
}
