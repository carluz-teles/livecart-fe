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
  // Faixa de uma linha: o card alto gastava ~120px de altura para uma frase,
  // exatamente o espaço que faltava para o editor em tela de notebook.
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-md border bg-card px-4 py-2.5">
      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Quando envia
      </span>
      <span className="truncate text-sm" title={meta.triggerLabel({})}>
        {meta.triggerLabel({})}
      </span>
    </div>
  )
}
