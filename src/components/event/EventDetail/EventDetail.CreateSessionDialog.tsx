"use client"

import { use } from "react"
import { SessionForm } from "@/components/event/SessionForm"
import { EventDetailContext } from "./EventDetailContext"

/**
 * "Nova sessão" pelo detalhe do evento.
 *
 * Era um stub: o handler fechava o diálogo e não criava nada
 * (`// TODO: wire to createSession mutation when BE ships it`). O backend já
 * tinha a rota, e a lista de eventos já usava o `SessionForm` real — havia dois
 * caminhos para a mesma ação, um deles mudo. Com a whitelist herdada pela
 * sessão nova, este é justamente o caminho que exercita a herança.
 *
 * Não há formulário próprio aqui de propósito: duplicá-lo era o que mantinha o
 * diálogo oferecendo TikTok/YouTube/Facebook, que nem o schema nem o backend
 * aceitam.
 */
export function EventDetailCreateSessionDialog() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event, createSessionOpen } = ctx.state
  const { setCreateSessionOpen, refresh } = ctx.actions

  return (
    <SessionForm
      eventId={event.id}
      open={createSessionOpen}
      onOpenChange={setCreateSessionOpen}
      onSuccess={refresh}
    />
  )
}
