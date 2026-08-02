"use client"

import { use } from "react"
import { AlertTriangle, Info } from "lucide-react"
import { SessionsTable } from "@/components/event/SessionsTable"
import { useSessionMetrics } from "@/hooks/event"
import { formatCurrency } from "@/lib/format"
import { EventDetailContext } from "./EventDetailContext"
import { EventDetailKpis } from "./EventDetail.Kpis"
import { EventDetailFunnel } from "./EventDetail.Funnel"
import { EventDetailTopProducts } from "./EventDetail.TopProducts"
import { EventDetailTopBuyers } from "./EventDetail.TopBuyers"

/**
 * Aba de métricas — os dois níveis lado a lado.
 *
 * O total do evento vem do `event-stats`; a quebra por transmissão vem do
 * `session-metrics`. Os dois são consultas diferentes sobre as mesmas linhas, e
 * a promessa da fatia de métricas é que fechem: a soma das sessões mais o balde
 * "sem transmissão" é, por construção, o total do evento.
 *
 * Por isso a divergência é EXIBIDA em vez de escondida. Um número que não fecha
 * é bug, e um painel que arredonda a diferença em silêncio é como o bug
 * sobrevive.
 */
export function EventDetailMetrics() {
  const ctx = use(EventDetailContext)
  const { data: metrics, isLoading } = useSessionMetrics(ctx?.state.event.id ?? "")
  if (!ctx) return null
  const { event, stats } = ctx.state

  const eventConfirmed = stats?.confirmedRevenue ?? 0
  const breakdownConfirmed = metrics?.confirmedRevenue ?? 0
  // Só compara quando as duas consultas já responderam — durante o carregamento
  // "0 contra 1200" não é divergência, é falta de dado.
  const mismatch =
    !isLoading && !!metrics && !!stats && eventConfirmed !== breakdownConfirmed

  // O aviso do corte da atribuição (migration 000119) só aparece quando ALGUMA
  // transmissão desta campanha é anterior ao corte. Mostrá-lo em toda campanha
  // treinaria o lojista a ignorá-lo — e aí ele não serve para nada justamente
  // no evento em que os números mudaram de significado.
  const preCutoverSessions =
    metrics?.sessions.filter((s) => s.attributionSource === "first_touch") ?? []
  const cutoverAt = metrics?.attributionCutoverAt
    ? new Date(metrics.attributionCutoverAt)
    : null

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-sm text-muted-foreground">
        A campanha tem dois níveis de número: o <strong>total do evento</strong> (o que o
        cliente pagou, de onde vier) e a <strong>quebra por sessão</strong> (qual
        transmissão trouxe cada item). A soma das sessões fecha com o total do evento — se
        não fechar, é bug, não arredondamento.
      </p>

      <EventDetailKpis />

      {mismatch && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            <strong>A soma das transmissões não fecha com o total do evento.</strong> O
            evento soma {formatCurrency(eventConfirmed)} e a quebra por transmissão soma{" "}
            {formatCurrency(breakdownConfirmed)}. Isso não deveria acontecer — registre o
            evento <span className="font-mono">{event.id}</span> no suporte.
          </p>
        </div>
      )}

      {preCutoverSessions.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              {preCutoverSessions.length === 1
                ? "Uma transmissão desta campanha é anterior"
                : `${preCutoverSessions.length} transmissões desta campanha são anteriores`}{" "}
              à mudança de cálculo
              {cutoverAt ? ` de ${cutoverAt.toLocaleDateString("pt-BR")}` : ""}.
            </strong>{" "}
            Até essa data, toda a quantidade de um produto era creditada à transmissão em
            que ele foi pedido <em>pela primeira vez</em>. A partir dela, cada adição é
            creditada à transmissão que a gerou. Comparar os dois lados compara duas
            definições, não o mesmo número em dois períodos.
          </p>
        </div>
      )}

      <SessionsTable
        sessions={event.sessions ?? []}
        isLoading={isLoading}
        unattributed={metrics?.unattributed ?? null}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <EventDetailFunnel />
        <EventDetailTopProducts />
        <EventDetailTopBuyers />
      </div>
    </div>
  )
}
