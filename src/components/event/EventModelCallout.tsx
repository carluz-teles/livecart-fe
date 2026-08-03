"use client"

import { useEffect, useState } from "react"
import { BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EVENT_MODEL_COPY } from "@/lib/event-copy"

const DISMISS_KEY = "livecart:event-model-callout-dismissed"

/**
 * A explicação do modelo, no lugar onde a dúvida nasce.
 *
 * O dono do produto pediu isto com todas as letras ("acho que deveria informar
 * ao usuário essas coisas"), e ele tinha razão: não existia UM texto no produto
 * definindo evento, sessão e mídia. O copy deck previa um modal de boas-vindas
 * automático — que NÃO foi implementado de propósito: um diálogo de primeira
 * visita apareceria no meio de uma regravação do roteiro do App Review da Meta.
 * Banner inline dispensável + diálogo sob demanda fazem o mesmo trabalho sem
 * interceptar ninguém.
 */
export function EventModelCallout() {
  // Começa escondido e só aparece depois de ler o storage: renderizar o banner
  // no servidor e removê-lo na hidratação faria a lista pular no primeiro
  // frame de toda visita.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(DISMISS_KEY) !== "1")
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // Storage bloqueado (aba anônima, política do navegador): o banner
      // simplesmente volta na próxima visita. Não é motivo para quebrar a tela.
    }
  }

  if (!visible) return null

  return (
    <div className="relative flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3 pr-8">
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{EVENT_MODEL_COPY.title}</p>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {EVENT_MODEL_COPY.cartRule}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <EventModelDialog
          trigger={
            <Button variant="outline" size="sm">
              Como funciona um evento?
            </Button>
          }
        />
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dispensar explicação"
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/** O modelo em uma página (copy deck §1.1), sob demanda. */
export function EventModelDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{EVENT_MODEL_COPY.title}</DialogTitle>
          <DialogDescription>
            Três níveis, uma regra que muda tudo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {EVENT_MODEL_COPY.levels.map((level) => (
            <div key={level.term} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{level.term}</p>
              <p className="mt-1 text-sm text-muted-foreground">{level.text}</p>
            </div>
          ))}

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-sm font-medium">Um carrinho por cliente, por campanha</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {EVENT_MODEL_COPY.cartRule}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Quando o prazo começa a correr</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {EVENT_MODEL_COPY.deadlineRule}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Os produtos são de cada transmissão</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {EVENT_MODEL_COPY.productRule}
            </p>
          </div>

          {/* O teto de quantidade tem tratamento próprio porque é a regra que
              bloqueia uma venda legítima sem avisar: o comprador atinge o
              limite na primeira sessão e não consegue comprar mais até a
              campanha inteira acabar. */}
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-sm font-medium">O teto de quantidade é da campanha</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {EVENT_MODEL_COPY.maxQuantityRule}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
