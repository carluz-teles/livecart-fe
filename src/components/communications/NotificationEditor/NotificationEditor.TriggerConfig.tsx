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
  // Bloco "Gatilho" do mockup (20/08/2026): tile de ícone + frase numa linha
  // de campo — leitura de configuração, sem falso affordance de clique.
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Clock className="h-5 w-5 text-accent-foreground" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold tracking-tight">Gatilho</h2>
        <p className="mt-2 rounded-md border bg-background px-3.5 py-2.5 text-sm">
          {meta.triggerLabel({})}
        </p>
      </div>
    </div>
  )
}
