"use client"

import { cn } from "@/lib/utils"

interface IntegrationCardContentProps {
  title: string
  description: string
  meta?: string
  className?: string
}

export function IntegrationCardContent({
  title,
  description,
  meta,
  className,
}: IntegrationCardContentProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{description}</p>
      {meta && (
        <p className="mt-1.5 text-xs text-muted-foreground/70">{meta}</p>
      )}
    </div>
  )
}
