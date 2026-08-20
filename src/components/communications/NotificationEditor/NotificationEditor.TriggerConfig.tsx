"use client"

import { Clock } from "lucide-react"

import { NOTIFICATION_META } from "@/lib/communications"
import type { NotificationType } from "@/types/notification.types"

interface NotificationEditorTriggerConfigProps {
  type: NotificationType
  /** Mantidos por compatibilidade de props — o lembrete de expiração saiu do
   *  catálogo em 20/08/2026 (nunca teve produtor no backend). */
  expirationReminderMinutes?: number
  cartExpirationMinutes?: number
  onMinutesChange?: (minutes: number) => void
}

export function NotificationEditorTriggerConfig({
  type,
}: NotificationEditorTriggerConfigProps) {
  const meta = NOTIFICATION_META[type]
  return (
    <div className="rounded-md border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium tracking-tight">Quando enviar</h2>
      </div>
      <p className="text-sm text-muted-foreground">{meta.triggerLabel({})}</p>
    </div>
  )
}
