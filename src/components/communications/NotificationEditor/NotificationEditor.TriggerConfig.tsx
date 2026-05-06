"use client"

import { Clock } from "lucide-react"

import { Input } from "@/components/ui/input"
import type { NotificationType } from "@/types/notification.types"

interface NotificationEditorTriggerConfigProps {
  type: NotificationType
  expirationReminderMinutes?: number
  cartExpirationMinutes?: number
  onMinutesChange: (minutes: number) => void
}

export function NotificationEditorTriggerConfig({
  type,
  expirationReminderMinutes = 15,
  cartExpirationMinutes = 30,
  onMinutesChange,
}: NotificationEditorTriggerConfigProps) {
  if (type !== "checkout_reminder") {
    return (
      <div className="rounded-md border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium tracking-tight">Quando enviar</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {type === "checkout_immediate"
            ? "Disparada imediatamente quando o cliente adiciona o primeiro item ao carrinho."
            : "Disparada toda vez que o cliente adiciona mais itens a um carrinho existente."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium tracking-tight">Quando enviar</h2>
      </div>
      <div className="flex flex-wrap items-baseline gap-2.5 text-sm text-muted-foreground">
        <span>Disparar</span>
        <Input
          type="number"
          min={1}
          max={Math.max(1, cartExpirationMinutes - 1)}
          value={expirationReminderMinutes}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v > 0) onMinutesChange(v)
          }}
          className="w-20 text-center"
        />
        <span>minutos antes do carrinho expirar.</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Carrinhos expiram em{" "}
        <span className="font-mono">{cartExpirationMinutes} min</span>. O lembrete
        chegará no{" "}
        <span className="font-mono">
          {Math.max(0, cartExpirationMinutes - expirationReminderMinutes)}º minuto
        </span>
        .
      </p>
    </div>
  )
}
