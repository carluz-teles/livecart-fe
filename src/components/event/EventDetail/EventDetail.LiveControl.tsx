"use client"

import { use } from "react"
import { LiveModeControlPanel } from "@/components/live/LiveModeControlPanel"
import { getEventKind } from "@/lib/event-kind"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailLiveControl() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state

  // Modo Live é execução de transmissão ao vivo: só aparece onde existe live.
  // O predicado era `!isPublicationOnly`, que respondia `false` também para
  // campanha sem sessão nenhuma — e um painel de live numa campanha sem live é
  // exatamente o tipo de coisa que faz o lojista achar que evento é live.
  if (!getEventKind(event).hasLive) return null
  if (event.status !== "active") return null

  return (
    <div className="space-y-2">
      <LiveModeControlPanel eventId={event.id} enabled />
      {/* O painel lê o estado de UMA sessão e escreve em TODAS as que estão no
          ar. Numa campanha mista isso não é óbvio, e trocar o produto em
          destaque achando que mexe só na live afeta o post também. */}
      <p className="text-xs text-muted-foreground">
        O modo live vale para todas as transmissões desta campanha que estiverem no ar.
      </p>
    </div>
  )
}
