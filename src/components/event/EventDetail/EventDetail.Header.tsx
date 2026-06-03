"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Instagram, Radio, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getEventStatusDisplay } from "@/lib/constants"
import { EventDetailContext } from "./EventDetailContext"
import { EventDetailActions } from "./EventDetail.Actions"

export function EventDetailHeader() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state
  const { refresh } = ctx.actions

  const isPost = event.type === "post"
  const statusCfg = getEventStatusDisplay(event.status, event.type)

  const fmt = (iso: string) =>
    format(new Date(iso), "d 'de' MMM, HH:mm", { locale: ptBR })

  // Post: show the scheduled window (or creation date). Live: sessions + start.
  let subtitle: string
  if (isPost) {
    const parts: string[] = []
    if (event.scheduledAt) parts.push(`começa ${fmt(event.scheduledAt)}`)
    else parts.push(`criado ${fmt(event.createdAt)}`)
    if (event.endsAt) parts.push(`termina ${fmt(event.endsAt)}`)
    subtitle = parts.join(" · ")
  } else {
    const sessionCount = event.sessions?.length ?? 0
    const startedAt = event.sessions?.[0]?.startedAt ?? event.createdAt
    subtitle =
      (sessionCount > 0 ? `${sessionCount} ${sessionCount === 1 ? "sessão" : "sessões"} · ` : "") +
      `iniciou ${fmt(startedAt)}`
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <Link
          href="/events"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
          aria-label="Voltar para eventos"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Operação · {isPost ? "Post" : "Live"}
          </span>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {event.title || (isPost ? "Promoção de post" : "Sem título")}
            </h1>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              {isPost ? <Instagram className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
              {isPost ? "Post" : "Live"}
            </Badge>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
        <EventDetailActions />
      </div>
    </div>
  )
}
