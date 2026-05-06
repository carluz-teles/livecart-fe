"use client"

import { cn } from "@/lib/utils"

interface NotificationCardContentProps {
  title: string
  description: string
  status?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}

export function NotificationCardContent({
  title,
  description,
  status,
  meta,
  className,
}: NotificationCardContentProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
        {status}
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{description}</p>
      {meta && <div className="mt-2.5">{meta}</div>}
    </div>
  )
}
