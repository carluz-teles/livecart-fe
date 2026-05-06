"use client"

import { Check, PauseCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type NotificationCardStatus = "active" | "paused"

interface NotificationCardStatusProps {
  status: NotificationCardStatus
  className?: string
}

const config: Record<NotificationCardStatus, { Icon: typeof Check; label: string; className: string }> = {
  active: {
    Icon: Check,
    label: "Ativa",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  paused: {
    Icon: PauseCircle,
    label: "Pausada",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function NotificationCardStatus({ status, className }: NotificationCardStatusProps) {
  const c = config[status]
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.className,
        className,
      )}
    >
      <c.Icon className="h-3 w-3" />
      {c.label}
    </div>
  )
}
