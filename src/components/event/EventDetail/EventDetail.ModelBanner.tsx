"use client"

import { use } from "react"
import { Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getEventKind } from "@/lib/event-kind"
import { EVENT_MODEL_COPY } from "@/lib/event-copy"
import { EventDetailContext } from "./EventDetailContext"

/**
 * A resposta direta ao "criei o evento e caí numa métrica de post".
 *
 * O relato não era bug de rota: a tela sempre foi 100% do evento. O que
 * acontecia é que a criação forçava a espécie, toda campanha nascia com UMA
 * sessão, e aí tudo — o rótulo "Campanha · Post", o badge, o menu de ações —
 * colapsava campanha e transmissão na mesma identidade. Sem nada dizendo o
 * contrário, ler aquilo como "métrica de um post" é a leitura correta do que
 * estava na tela.
 *
 * Este bloco fica acima dos KPIs e diz as duas coisas que faltavam: os números
 * abaixo são da campanha inteira, e esta campanha pode receber mais
 * transmissões.
 */
export function EventDetailModelBanner() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state
  const { setCreateSessionOpen } = ctx.actions

  const kind = getEventKind(event)
  const sessions = event.sessions ?? []
  const sessionCount = sessions.length
  // Uma campanha criada sem transmissão nasce com a sessão-marcador: ela existe
  // no banco porque whitelist e modo live moram em live_sessions, mas ainda não
  // é transmissão nenhuma. Anunciá-la como "Live 1" afirma algo que o lojista
  // não criou — e "Live" é so o default da coluna, não uma escolha dele.
  const onlyPlaceholder =
    sessionCount === 1 && !(sessions[0]?.platforms?.length ?? 0)
  const canAddSession = event.status === "active" || event.status === "scheduled"

  // Campanha já mista não precisa da explicação: ela é a prova viva do modelo.
  const needsExplanation = sessionCount <= 1

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <Layers className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{EVENT_MODEL_COPY.shortIntro}</p>
          {needsExplanation && (
            <p className="text-sm text-muted-foreground">
              {sessionCount === 0 || onlyPlaceholder ? (
                <>
                  <strong className="text-foreground">
                    Esta campanha ainda não tem transmissão configurada.
                  </strong>{" "}
                  Vincule uma live, um post ou um reel na aba Sessões — é a transmissão
                  que captura os comentários.
                </>
              ) : (
                <>
                  <strong className="text-foreground">
                    Esta campanha tem uma transmissão ({kind.label} 1).
                  </strong>{" "}
                  Você pode adicionar outras — live, post, reel ou story — e todas somam
                  no mesmo carrinho de cada cliente.
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {canAddSession && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => setCreateSessionOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar sessão
        </Button>
      )}
    </div>
  )
}
