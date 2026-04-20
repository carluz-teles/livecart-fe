"use client"

import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 scale-150 rounded-full bg-primary/5 blur-xl" />
          {/* Icon container */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            <Icon className="h-8 w-8 text-muted-foreground/60" />
          </div>
        </div>
      )}

      <div className="max-w-sm space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="mt-2 gap-2"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}

      {children}
    </div>
  )
}

// Variants for specific contexts
export function EmptyStateInline({
  icon: Icon,
  message,
  className,
}: {
  icon?: LucideIcon
  message: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{message}</span>
    </div>
  )
}
