"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, PackageCheck, Store } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useModoDeReserva, useTrocaDeModoDeReserva } from "@/hooks/integration"
import type { ModoDeReserva as Modo } from "@/types"
import { cn } from "@/lib/utils"

/**
 * Quem segura a peça entre o comentário e o pagamento.
 *
 * É uma escolha REAL — diferente do ERPReserva do Tiny, que só informa — e por
 * isso a tela mostra três coisas em vez de um switch:
 *
 *  1. O que o lojista escolheu.
 *  2. O que está valendo de verdade. Os dois divergem quando ele pede a reserva
 *     nativa e a conta do ERP não a tem ligada; sem mostrar a diferença, ele
 *     escolheria e não entenderia por que nada mudou.
 *  3. O PREÇO de cada modo, em português. A consequência de escolher errado é
 *     de negócio (peça vendida duas vezes, ou canal que não enxerga a venda),
 *     e um lojista que não entende o preço não escolhe — adivinha.
 */
export function ModoDeReserva({ integrationId }: { integrationId: string }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useModoDeReserva(integrationId, { enabled: open })
  const troca = useTrocaDeModoDeReserva(integrationId, data)

  const divergente = data && data.modo !== data.modoEfetivo

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <PackageCheck className="h-3.5 w-3.5" />
        Reserva de estoque
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quem segura a peça durante a live</DialogTitle>
            <DialogDescription>
              Entre o comentário da compradora e o pagamento, alguém precisa
              garantir que ninguém mais compre a mesma peça.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !data ? (
            <p className="py-6 text-sm text-muted-foreground">
              Não consegui ler a configuração agora. Feche e abra de novo.
            </p>
          ) : (
            <div className="space-y-4">
              <OpcaoDeModo
                valor="local"
                titulo="O LiveCart segura"
                icone={<Store className="h-4 w-4" />}
                descricao="O pedido só vai para o ERP quando o pagamento entra. Nunca escrevemos no seu estoque."
                selecionado={data.modo === "local"}
                efetivo={data.modoEfetivo === "local"}
                onSelect={() => troca.pedir("local")}
                salvando={troca.salvando}
              />

              <OpcaoDeModo
                valor="nativa"
                titulo="O ERP reserva"
                icone={<PackageCheck className="h-4 w-4" />}
                descricao="O pedido nasce no ERP no primeiro comentário e o próprio ERP tira a peça do saldo na hora."
                selecionado={data.modo === "nativa"}
                efetivo={data.modoEfetivo === "nativa"}
                onSelect={() => troca.pedir("nativa")}
                salvando={troca.salvando}
                indisponivel={!data.capacidadeConfirmada}
              />

              {/* Trancado ≠ proibido para sempre: assim que uma venda passar
                  pelo ERP com a Reserva ligada, a observação chega sozinha no
                  webhook de estoque e o cartão destrava. */}
              {!data.capacidadeConfirmada && data.modo !== "nativa" ? (
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  Ainda não vimos este ERP segurando estoque — o que é normal
                  enquanto não houver pedido em aberto lá. Ligar a Reserva é
                  decisão sua, no painel do ERP; se já ligou, é só confirmar ao
                  escolher.
                </p>
              ) : null}

              {divergente ? (
                <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-amber-700 dark:text-amber-500">
                      Sua escolha ainda não está valendo
                    </p>
                    <p className="text-muted-foreground">{data.motivo}</p>
                    {data.comoLigarNoErp ? (
                      <p className="text-muted-foreground">{data.comoLigarNoErp}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  O que isso significa na prática
                </p>
                <p className="text-sm text-muted-foreground">{data.preco}</p>
              </div>

              {/* Duas direções confirmam, por motivos opostos: sair do nativo
                  tira de cena quem segura a peça hoje; entrar no nativo sem
                  termos visto o ERP segurando é uma declaração do lojista sobre
                  a configuração DELE, no ERP dele. */}
              {troca.aConfirmar === "local" ? (
                <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-destructive">
                        O ERP vai parar de reservar durante a live
                      </p>
                      <p className="text-muted-foreground">
                        Hoje o pedido nasce no seu ERP no primeiro comentário e é
                        ele quem tira a peça do saldo. Se mudar, o pedido só vai
                        para o ERP quando o pagamento entrar — e nesse intervalo
                        quem segura a peça é só o LiveCart. Outro canal de venda
                        continuará vendo a peça disponível.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={troca.cancelar}>
                      Manter como está
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={troca.confirmar}
                      disabled={troca.salvando}
                    >
                      Mudar mesmo assim
                    </Button>
                  </div>
                </div>
              ) : troca.aConfirmar === "nativa" ? (
                <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-amber-700 dark:text-amber-500">
                        Confirma que a Reserva está ligada no seu ERP?
                      </p>
                      <p className="text-muted-foreground">
                        Ainda não vimos este ERP segurando estoque — o que é normal
                        se não houver pedido em aberto lá agora. A partir desta
                        escolha o LiveCart <strong>para de segurar a peça</strong> e
                        passa a contar com o ERP. Se a Reserva não estiver ligada,
                        ninguém segura, e a mesma peça pode ser vendida duas vezes.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={troca.cancelar}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={troca.confirmar} disabled={troca.salvando}>
                      Sim, está ligada
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function OpcaoDeModo({
  titulo,
  icone,
  descricao,
  selecionado,
  efetivo,
  onSelect,
  salvando,
  indisponivel,
}: {
  valor: Modo
  titulo: string
  icone: React.ReactNode
  descricao: string
  selecionado: boolean
  efetivo: boolean
  onSelect: () => void
  salvando: boolean
  indisponivel?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      // TRANCADO, e não só pintado. O selo "Requer configuração no ERP" já
      // existia, mas o botão continuava clicável e o backend gravava assim
      // mesmo — um bilhete numa porta destrancada. Na live o LiveCart parava de
      // segurar a peça achando que o ERP a segurava; ninguém segurava, e a
      // mesma peça era vendida duas vezes.
      disabled={salvando}
      aria-pressed={selecionado}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selecionado ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
        salvando && "cursor-wait opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 shrink-0",
            selecionado ? "text-primary" : "text-muted-foreground"
          )}
        >
          {icone}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{titulo}</span>
            {/* "Em uso" é o que VALE, e é diferente de "escolhido". Um lojista
                que pediu o nativo sem ligar a config no ERP precisa ver o selo
                no OUTRO cartão para entender o que está acontecendo. */}
            {efetivo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Em uso
              </span>
            ) : null}
            {indisponivel && !efetivo ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Ainda não vimos o ERP reservando
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>
      </div>
    </button>
  )
}
