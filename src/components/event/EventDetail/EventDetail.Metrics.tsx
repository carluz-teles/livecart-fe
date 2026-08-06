"use client"

import { use } from "react"
import { EventDetailContext } from "./EventDetailContext"
import { EventDetailKpis } from "./EventDetail.Kpis"
import { EventDetailFunnel } from "./EventDetail.Funnel"
import { EventDetailTopProducts } from "./EventDetail.TopProducts"
import { EventDetailTopBuyers } from "./EventDetail.TopBuyers"

/**
 * Aba de métricas — o nível da CAMPANHA.
 *
 * Era quase uma cópia da visão geral (KPIs + Sessões + Funil + TopProducts +
 * TopBuyers), com a tabela de sessões duplicada de lá. Duas cópias da mesma
 * lista, alimentadas por consultas diferentes, é exatamente como as duas fontes
 * divergem sem ninguém perceber. A quebra por transmissão passou a viver num
 * lugar só: a aba Sessões.
 */
export function EventDetailMetrics() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-sm text-muted-foreground">
        A campanha tem dois níveis de número: o <strong>total do evento</strong> (o que o
        cliente pagou, de onde vier) e a <strong>quebra por sessão</strong> (qual
        transmissão trouxe cada item), na aba Sessões. A soma das sessões fecha com o
        total do evento — se não fechar, é bug, não arredondamento.
      </p>

      <EventDetailKpis />

      <div className="grid gap-4 lg:grid-cols-3">
        <EventDetailFunnel />
        <EventDetailTopProducts />
        <EventDetailTopBuyers />
      </div>
    </div>
  )
}
