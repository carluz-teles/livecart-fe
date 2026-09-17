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

export function IntegrationCardRoot({
  children,
  provider,
  connected = false,
  className,
  onClick,
}: IntegrationCardRootProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border bg-card",
        connected && "border-foreground/20",
        onClick && "cursor-pointer",
        className,
      )}
      data-provider={provider}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
