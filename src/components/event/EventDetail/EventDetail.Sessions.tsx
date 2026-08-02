"use client"

import { use, useState } from "react"
import { AlertTriangle, Info } from "lucide-react"
import { SessionsTable } from "@/components/event/SessionsTable"
import { SessionMediaForm } from "@/components/event/SessionMediaForm"
import { useSessionMetrics } from "@/hooks/event"
import { formatCurrency } from "@/lib/format"
import type { EventSession } from "@/types/event.types"
import { EventDetailContext } from "./EventDetailContext"

/**
 * A lista de transmissões da campanha, com a métrica de cada uma.
 *
 * É o segundo nível do evento: o agregado (KPIs, funil, top produtos) responde
 * "quanto a campanha vendeu"; esta lista responde "qual transmissão trouxe o
 * quê". Os avisos de divergência e de corte histórico moram aqui porque é aqui
 * que a quebra por sessão é exibida — na aba de Métricas eles apareciam ao lado
 * de uma cópia da mesma tabela.
 */
export function EventDetailSessions() {
  const ctx = use(EventDetailContext)
  const { data: metrics, isLoading, isError } = useSessionMetrics(ctx?.state.event.id ?? "")
  // A sessão que está recebendo a publicação. `null` = diálogo fechado.
  const [linkingSession, setLinkingSession] = useState<EventSession | null>(null)
  if (!ctx) return null
  const { event, stats } = ctx.state
  const { setCreateSessionOpen, refresh } = ctx.actions

  // Campanha AGENDADA também aceita transmissão nova: é literalmente o caso de
  // uso do guarda-chuva ("marco a Semana Black hoje, penduro a live de segunda
  // depois"). O gate só de `active` matava esse caminho.
  const canAddSession = event.status === "active" || event.status === "scheduled"

  const eventConfirmed = stats?.confirmedRevenue ?? 0
  const breakdownConfirmed = metrics?.confirmedRevenue ?? 0
  // Só compara quando as duas consultas já responderam — durante o carregamento
  // "0 contra 1200" não é divergência, é falta de dado.
  const mismatch =
    !isLoading && !!metrics && !!stats && eventConfirmed !== breakdownConfirmed

  // O aviso do corte da atribuição (migration 000119) só aparece quando ALGUMA
  // transmissão desta campanha é anterior ao corte. Mostrá-lo em toda campanha
  // treinaria o lojista a ignorá-lo.
  const preCutoverSessions =
    metrics?.sessions.filter((s) => s.attributionSource === "first_touch") ?? []
  const cutoverAt = metrics?.attributionCutoverAt
    ? new Date(metrics.attributionCutoverAt)
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* A falha da métrica por sessão era engolida: a coluna "Vendido" ia toda
          para R$ 0,00 enquanto os KPIs mostravam a receita real, e o teste de
          divergência exigia `metrics` — ou seja, o alarme não disparava
          justamente quando a divergência era máxima. */}
      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              Não foi possível calcular a quebra por transmissão.
            </strong>{" "}
            Os valores por sessão abaixo podem estar zerados — o total da campanha, nos
            KPIs, continua correto. Atualize a página para tentar de novo.
          </p>
        </div>
      )}

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

      {/* A tabela aparece para TODA campanha. Antes ela se escondia quando o
          evento era post/story — o que fazia sentido quando um evento era uma
          publicação só. Agora post e story SÃO sessões: escondê-la deixaria o
          lojista sem ver as transmissões que ele mesmo criou, e sem ver quanto
          cada uma vendeu.
          O balde "sem transmissão" só existe no endpoint de métrica — sem ele a
          coluna de receita não soma o faturamento do evento. */}
      <SessionsTable
        sessions={event.sessions ?? []}
        isLoading={isLoading}
        unattributed={metrics?.unattributed ?? null}
        onAddSession={canAddSession ? () => setCreateSessionOpen(true) : undefined}
        // Vincular a publicação só faz sentido enquanto a campanha ainda vende:
        // numa campanha encerrada o comentário não viraria carrinho de qualquer
        // jeito, e o botão prometeria captura que não vai acontecer.
        onLinkMedia={canAddSession ? setLinkingSession : undefined}
      />

      <SessionMediaForm
        eventId={event.id}
        session={linkingSession}
        onOpenChange={(open) => !open && setLinkingSession(null)}
        onSuccess={refresh}
      />
    </div>
  )
}
