"use client"

import { use, useState } from "react"
import { Link2, Loader2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCartJoinLink, useJoinCandidates, useJoinOrders } from "@/hooks/integration"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { JoinCandidate } from "@/types"

import { OrderDetailContext } from "./OrderDetailContext"

/**
 * Juntar pedidos — no ERP, não aqui.
 *
 * A cliente já tinha um pedido em aberto e comentou na live: ficam dois pedidos
 * dela no Tiny, cada um segurando peça, cada um querendo o seu frete e a sua
 * nota. Juntar resolve isso do lado de lá — um pedido só, com tudo dentro.
 *
 * Deste lado os pedidos continuam separados de propósito: foram duas compras, e
 * o lojista precisa poder olhar cada uma com o seu histórico e o seu pagamento.
 * O que esta seção faz é deixar o vínculo visível, para ninguém tratar um dos
 * dois como pedido solto e mandar frete duplicado.
 */
export function OrderDetailJoin() {
  const ctx = use(OrderDetailContext)
  const [aberto, setAberto] = useState(false)
  const cartId = ctx?.state.order.id ?? ""
  const link = useCartJoinLink(cartId)

  if (!ctx || !cartId) return null

  const vinculo = link.data
  const ehJuntado = Boolean(vinculo?.hostCartId)
  const ehAnfitriao = Boolean(vinculo?.joinedShortIds?.length)

  // Enquanto carrega, nada — piscar um botão que pode sumir é pior que esperar.
  if (link.isLoading || !vinculo) return null

  // Este pedido não pode entrar numa junção. Some com a seção em vez de
  // oferecer um botão que leva a uma recusa: em staging, em 28/08, um carrinho
  // vencido mostrou "Juntar", o lojista escolheu o outro pedido, confirmou, e só
  // então levou o erro. O botão prometia o que a regra não ia entregar.
  if (!vinculo.canJoin && !ehJuntado) {
    return <ImpedimentoDeJuncao motivo={vinculo.cannotJoinReason} />
  }

  // Pedido já juntado a outro: só informa, e aponta para o dono do pedido.
  if (ehJuntado) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          Juntado ao pedido #{vinculo?.hostShortId}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          No Tiny existe um pedido só, com os itens dos dois. Este continua aqui com o
          histórico e o pagamento dele, mas não tem pedido próprio no ERP — o frete e a
          nota saem pelo #{vinculo?.hostShortId}.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card px-3.5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              {ehAnfitriao ? "Pedidos juntados neste" : "Juntar com outro pedido"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {ehAnfitriao
                ? `No Tiny é um pedido só, com os itens deste e do${
                    (vinculo?.joinedShortIds?.length ?? 0) > 1 ? "s" : ""
                  } #${vinculo?.joinedShortIds?.join(", #")}. Um frete, uma nota.`
                : "Se a cliente já tinha um pedido em aberto, junte os dois no Tiny — um frete e uma nota só. Aqui eles continuam separados."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAberto(true)}>
            {ehAnfitriao ? "Juntar mais" : "Juntar"}
          </Button>
        </div>
      </div>

      {aberto ? (
        <JoinDialog cartId={cartId} shortId={ctx.state.order.shortId} onClose={() => setAberto(false)} />
      ) : null}
    </>
  )
}

/**
 * Por que este pedido não pode ser juntado.
 *
 * Só aparece quando há algo a explicar — um pedido normal não mostra nada. Dizer
 * o motivo em vez de só esconder o botão evita a pergunta "e por que não tem a
 * opção aqui?", que é a que o lojista faria olhando dois pedidos parecidos com
 * comportamentos diferentes.
 */
function ImpedimentoDeJuncao({ motivo }: { motivo?: string }) {
  const texto: Record<string, string> = {
    cancelado_ou_vencido:
      "Este pedido está cancelado ou venceu — não há venda viva a juntar.",
    estornado: "Este pedido foi estornado; o dinheiro já voltou.",
    faturado:
      "A nota deste pedido já foi emitida. Somar item nele seria emitir nota errada.",
    pedido_cancelado_no_erp: "O pedido foi cancelado no Tiny.",
    ja_juntado: "Este pedido já faz parte de outra junção.",
  }
  const msg = motivo ? texto[motivo] : undefined
  if (!msg) return null

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        Não dá para juntar
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{msg}</p>
    </div>
  )
}

function JoinDialog({
  cartId,
  shortId,
  onClose,
}: {
  cartId: string
  shortId: number | string
  onClose: () => void
}) {
  const candidatos = useJoinCandidates(cartId)
  const juntar = useJoinOrders()
  const [escolhido, setEscolhido] = useState<string | null>(null)

  const confirmar = () => {
    if (!escolhido) return
    juntar.mutate(
      { cartAId: cartId, cartBId: escolhido },
      {
        onSuccess: (r) => {
          toast.success("Pedidos juntados no Tiny", {
            description: r.orderReleased
              ? `Um pedido só agora. O ${r.orderReleased} foi cancelado lá.`
              : "Um pedido só agora.",
          })
          onClose()
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e)
          toast.error("Não consegui juntar", { description: msg })
        },
      },
    )
  }

  const lista = candidatos.data ?? []

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Juntar com o pedido #{shortId}</DialogTitle>
          <DialogDescription>
            No Tiny os dois viram <strong>um pedido só</strong> — um frete, uma nota. Aqui
            eles continuam separados, cada um com o seu histórico e o seu pagamento.
          </DialogDescription>
        </DialogHeader>

        {candidatos.isLoading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Procurando pedidos da mesma cliente…
          </p>
        ) : lista.length === 0 ? (
          <div className="rounded-lg border bg-muted/40 px-3.5 py-3">
            <p className="text-sm font-medium text-foreground">
              Nenhum outro pedido desta cliente
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Só aparecem aqui pedidos vivos, ainda sem nota emitida e fora de outra
              junção. Pedido faturado não pode receber item — somar nele seria emitir
              nota errada.
            </p>
          </div>
        ) : (
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {lista.map((c) => (
              <CandidatoRow
                key={c.cartId}
                candidato={c}
                escolhido={escolhido === c.cartId}
                onEscolher={() => setEscolhido(c.cartId)}
              />
            ))}
          </div>
        )}

        {escolhido ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300/70 bg-amber-50/70 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/20">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-700 dark:text-amber-400" />
            <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
              Um dos dois pedidos será <strong>cancelado no Tiny</strong> e o outro fica com
              tudo. Não dá para desfazer pelo painel.
            </p>
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={juntar.isPending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={confirmar} disabled={!escolhido || juntar.isPending}>
            {juntar.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Juntando
              </>
            ) : (
              "Juntar no Tiny"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CandidatoRow({
  candidato,
  escolhido,
  onEscolher,
}: {
  candidato: JoinCandidate
  escolhido: boolean
  onEscolher: () => void
}) {
  const pago = candidato.paymentStatus === "paid"
  return (
    <button
      type="button"
      onClick={onEscolher}
      aria-pressed={escolhido}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        escolhido
          ? "border-primary bg-primary/5"
          : "border-border hover:border-foreground/20 hover:bg-muted/50",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">#{candidato.shortId}</span>
          {pago ? (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              pago
            </span>
          ) : null}
          {candidato.erpOrderNumber ? (
            <span className="font-mono text-[10px] text-muted-foreground">
              Tiny nº {candidato.erpOrderNumber}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {candidato.eventTitle} · {candidato.itemCount}{" "}
          {candidato.itemCount === 1 ? "item" : "itens"}
        </span>
      </span>
      <span className="flex-shrink-0 text-sm font-medium tabular-nums text-foreground">
        {formatCurrency(candidato.totalCents)}
      </span>
    </button>
  )
}
