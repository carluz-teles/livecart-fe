"use client"

import { use } from "react"
import { SessionsTable } from "@/components/event/SessionsTable"
import { useSessionMetrics } from "@/hooks/event"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailSessions() {
  const ctx = use(EventDetailContext)
  const { data: metrics } = useSessionMetrics(ctx?.state.event.id ?? "")
  if (!ctx) return null
  const { event } = ctx.state
  const { setCreateSessionOpen } = ctx.actions

  // A tabela aparece para TODA campanha. Antes ela se escondia quando o evento
  // era post/story — o que fazia sentido quando um evento era uma publicação
  // só. Agora post e story SÃO sessões: escondê-la deixaria o lojista sem ver
  // as transmissões que ele mesmo criou, e sem ver quanto cada uma vendeu.
  //
  // A quebra por transmissão já viaja dentro de cada sessão do detalhe. O que
  // só existe no endpoint de métrica é o balde "sem transmissão" — e sem ele a
  // coluna de receita não soma o faturamento do evento.
  return (
    <SessionsTable
      sessions={event.sessions ?? []}
      isLoading={false}
      unattributed={metrics?.unattributed ?? null}
      onAddSession={event.status === "active" ? () => setCreateSessionOpen(true) : undefined}
    />
  )
}
