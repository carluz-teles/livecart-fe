"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Switch } from "@/components/ui/switch"

interface NotificationEditorHeaderProps {
  title: string
  description: string
  Icon: LucideIcon
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  trailing?: React.ReactNode
  backHref?: string
}

export function NotificationEditorHeader({
  title,
  description,
  Icon,
  enabled,
  onEnabledChange,
  trailing,
  backHref = "/communications",
}: NotificationEditorHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para Comunicações
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Icon className="h-6 w-6 text-accent-foreground" strokeWidth={1.6} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {trailing}
          <span className="text-sm text-muted-foreground">Status</span>
          <div className="flex items-center gap-2.5 rounded-full border bg-card py-1.5 pl-3.5 pr-2">
            <span className="text-sm font-medium">
              {enabled ? "Ativa" : "Pausada"}
            </span>
            <Switch
              checked={enabled}
              onCheckedChange={onEnabledChange}
              aria-label="Ativar notificação"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
