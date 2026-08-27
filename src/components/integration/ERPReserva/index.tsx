"use client"

import { useState } from "react"
import {
  ChevronRight,
  CircleHelp,
  Loader2,
  PackageCheck,
  ShoppingCart,
  Warehouse,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useERPReserva } from "@/hooks/integration"
import { cn } from "@/lib/utils"

/**
 * O módulo de Reserva de Estoque do Tiny — informado, não configurado.
 *
 * Substituiu o toggle "Descontar o que já está reservado no ERP", que oferecia
 * uma escolha que não existe mais: o LiveCart lê SEMPRE o saldo disponível,
 * porque o físico conta peça que já tem dono e vender em cima dele é vender o
 * que não existe.
 *
 * A escolha que sobrou é real, mas mora na conta do lojista no Tiny: com a
 * Reserva ativa, o pedido criado no primeiro comentário já tira a peça da
 * prateleira; sem ela, a peça só sai no faturamento. Explicar isso vale mais
 * que um switch, porque o switch dava a impressão de que a decisão era nossa.
 *
 * Três estados, e o do meio é "não sei" de propósito — ver ERPReservaStatus.
 */
export function ERPReserva({ integrationId }: { integrationId: string }) {
  const [open, setOpen] = useState(false)
  const query = useERPReserva(integrationId)

  const status = query.data?.status
  const confirmada = status === "confirmada"

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Como o estoque é reservado — abrir explicação"
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-all duration-150",
          confirmada
            ? "border-emerald-200/70 bg-emerald-50/40 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
            : "border-border bg-muted/40 hover:border-foreground/20 hover:bg-muted"
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
            confirmada
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-muted-foreground/15 text-muted-foreground"
          )}
        >
          {query.isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : confirmada ? (
            <PackageCheck className="h-3 w-3" />
          ) : (
            <CircleHelp className="h-3 w-3" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-medium leading-tight",
              confirmada ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"
            )}
          >
            {confirmada ? "A live segura a peça" : "Como o estoque é reservado"}
          </span>
          <span
            className={cn(
              "block leading-tight",
              confirmada
                ? "text-emerald-700/80 dark:text-emerald-400/80"
                : "text-muted-foreground"
            )}
          >
            {confirmada
              ? "Reserva de Estoque ativa no Tiny"
              : "Quem decide é a sua conta no Tiny"}
          </span>
        </span>

        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
      </button>

      <ReservaDialog
        open={open}
        onOpenChange={setOpen}
        status={status}
        example={query.data?.example}
        reason={query.data?.reason}
        sampled={query.data?.sampled ?? 0}
        loading={query.isLoading}
        onRecheck={() => query.refetch()}
        rechecking={query.isFetching && !query.isLoading}
      />
    </>
  )
}

interface ReservaDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  status?: string
  example?: string
  reason?: string
  sampled: number
  loading: boolean
  onRecheck: () => void
  rechecking: boolean
}

function ReservaDialog({
  open,
  onOpenChange,
  status,
  example,
  reason,
  sampled,
  loading,
  onRecheck,
  rechecking,
}: ReservaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Como o estoque é reservado</DialogTitle>
          <DialogDescription>
            O LiveCart lê sempre o saldo <strong>disponível</strong> do Tiny — nunca o
            físico. O físico conta peça que já tem dono, e vender em cima dele é vender o
            que não existe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Evidencia
            status={status}
            example={example}
            reason={reason}
            sampled={sampled}
            loading={loading}
          />

          <div>
            <p className="mb-2 text-xs font-medium text-foreground">
              A escolha é sua, e ela fica no Tiny
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Escolha
                icon={<Warehouse className="h-3.5 w-3.5" />}
                titulo="Com Reserva de Estoque"
                corpo="O pedido nasce no primeiro comentário e já tira a peça da prateleira. Ninguém compra o que outra pessoa pediu."
                recomendada
              />
              <Escolha
                icon={<ShoppingCart className="h-3.5 w-3.5" />}
                titulo="Sem o módulo"
                corpo="O pedido nasce igual, mas a peça só sai do estoque no faturamento. Duas pessoas podem pedir a mesma."
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Para mudar, ative ou desative a Reserva de Estoque na sua conta do Tiny. Não
              há nada a configurar aqui.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onRecheck} disabled={rechecking}>
            {rechecking ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Verificando
              </>
            ) : (
              "Verificar de novo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A evidência, dita por extenso.
 *
 * "Indeterminada" NÃO usa cor de alerta, e isso é decisão de desenho: não é um
 * problema a resolver, é uma coisa que a API do Tiny não deixa saber. Pintar de
 * âmbar treinaria o lojista a ignorar âmbar — e quando um aviso de verdade
 * aparecer no card ao lado, ele já vai estar imune.
 */
function Evidencia({
  status,
  example,
  reason,
  sampled,
  loading,
}: {
  status?: string
  example?: string
  reason?: string
  sampled: number
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Verificando no Tiny…
      </div>
    )
  }

  if (status === "confirmada") {
    return (
      <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-3 py-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-900 dark:text-emerald-100">
          <PackageCheck className="h-3.5 w-3.5" />
          Reserva de Estoque está ativa
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
          {example
            ? `Encontramos unidade reservada em “${example}”. É prova de que o módulo está ligado.`
            : "Encontramos unidade reservada nos seus produtos."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
        Não deu para confirmar
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {reason
          ? reason
          : sampled > 0
            ? `Nenhum dos ${sampled} produtos conferidos tem unidade reservada agora. Isso acontece tanto com o módulo desligado quanto com a loja parada — não dá para distinguir os dois pela API do Tiny.`
            : "Ainda não há produtos com estoque para conferir."}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        Para ter certeza, olhe um produto no Tiny: se ele mostra o campo{" "}
        <strong>reservado</strong>, o módulo está ativo.
      </p>
    </div>
  )
}

function Escolha({
  icon,
  titulo,
  corpo,
  recomendada,
}: {
  icon: React.ReactNode
  titulo: string
  corpo: string
  recomendada?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        recomendada ? "border-foreground/15 bg-background" : "bg-muted/30"
      )}
    >
      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {titulo}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{corpo}</p>
    </div>
  )
}
