"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Aperture, Instagram, Layers, Radio, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getEventStatusDisplay, EVENT_STATUS_HINT } from "@/lib/constants"
import { getEventKind, describeEventKind } from "@/lib/event-kind"
import { EventDetailContext } from "./EventDetailContext"
import { EventDetailActions } from "./EventDetail.Actions"

const KIND_ICONS = {
  radio: Radio,
  instagram: Instagram,
  aperture: Aperture,
  layers: Layers,
} as const

export function EventDetailHeader() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state
  const { refresh } = ctx.actions

  // A espécie da campanha sai das sessões dela. `event.type` não existe mais.
  const kind = getEventKind(event)
  const KindIcon = KIND_ICONS[kind.icon]
  const statusCfg = getEventStatusDisplay(event.status, kind.isPublicationOnly)

  const fmt = (iso: string) =>
    format(new Date(iso), "d 'de' MMM, HH:mm", { locale: ptBR })

  // A legenda é da JANELA da campanha, não da primeira transmissão: com várias
  // sessões em dias diferentes, "iniciou às 20h" respondia sobre a segunda-feira
  // enquanto o lojista olhava a semana inteira.
  const parts: string[] = []
  const sessionCount = event.sessions?.length ?? 0
  if (sessionCount > 0) {
    parts.push(`${sessionCount} ${sessionCount === 1 ? "sessão" : "sessões"}`)
  }
  if (event.scheduledAt) parts.push(`abre ${fmt(event.scheduledAt)}`)
  else parts.push(`criada ${fmt(event.createdAt)}`)
  if (event.endsAt) parts.push(`fecha ${fmt(event.endsAt)}`)
  const subtitle = parts.join(" · ")

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
          {/* Só "Campanha". Era "Campanha · Post", e numa campanha de uma
              sessão só isso vestia o evento com a identidade da transmissão —
              o cabeçalho dizia "post" e o lojista lia a tela inteira como a de
              um post. A espécie continua visível no badge ao lado, que é
              informação da sessão, não do container. */}
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Campanha
          </span>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {event.title || "Sem título"}
            </h1>
            <Badge
              variant="outline"
              className="gap-1 text-muted-foreground"
              title={
                kind.types.length > 0
                  ? `Transmissões desta campanha: ${describeEventKind(kind)}.`
                  : "Esta campanha ainda não tem transmissão."
              }
            >
              <KindIcon className="h-3 w-3" />
              {kind.label}
            </Badge>
            <Badge variant={statusCfg.variant} title={EVENT_STATUS_HINT[event.status]}>
              {statusCfg.label}
            </Badge>
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
