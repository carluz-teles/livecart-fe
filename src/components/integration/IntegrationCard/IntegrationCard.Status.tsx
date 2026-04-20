"use client"

import { Check, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusType = "active" | "pending" | "error" | "disconnected"

interface IntegrationCardStatusProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { icon: React.ReactNode; label: string; className: string }> = {
  active: {
    icon: <Check className="h-3 w-3" />,
    label: "Conectado",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  pending: {
    icon: <Clock className="h-3 w-3" />,
    label: "Pendente",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  error: {
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Erro",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  disconnected: {
    icon: null,
    label: "Desconectado",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function IntegrationCardStatus({ status, className }: IntegrationCardStatusProps) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </div>
  )
}
