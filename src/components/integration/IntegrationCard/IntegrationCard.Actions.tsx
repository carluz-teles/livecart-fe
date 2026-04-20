"use client"

import { cn } from "@/lib/utils"

interface IntegrationCardActionsProps {
  children: React.ReactNode
  className?: string
}

export function IntegrationCardActions({ children, className }: IntegrationCardActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  )
}
