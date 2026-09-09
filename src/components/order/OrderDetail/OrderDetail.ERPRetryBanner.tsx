"use client"

import { use } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useRetryERPFinalisation } from "@/hooks/order"
import { formatAttemptCount, formatDateTime } from "@/lib/format"

import { OrderDetailContext } from "./OrderDetailContext"
import { useERPConectado } from "@/hooks/integration"

// O pedido pago cuja APROVAÇÃO no ERP falhou.
//
// O texto mudou junto com o modelo. Antes o pedido só nascia no pagamento, e
// falhar aqui significava "a venda não chegou ao ERP" — daí "não foi enviado".
// Agora o pedido nasce no primeiro comentário e já está lá desde a live; o que
// pode falhar depois do pagamento é a APROVAÇÃO e a gravação das parcelas.
//
// Dizer "não foi enviado" mandaria o lojista procurar no ERP um pedido que
// está bem na frente dele, em situação Aberta — e o faria criar um duplicado à
// mão. A ação continua sendo a mesma, e continua necessária: são os dois pontos
// que ainda marcam 'failed' (ver MarkFinalisationFailed).
export function OrderDetailERPRetryBanner() {
  // O nome do ERP CONECTADO, e não "Tiny" cravado. Este banner não tem gate de
  // provider: numa loja Bling ele dizia "O pedido existe no Tiny" oito linhas
  // acima do erro que começa com "bling: HTTP 400", na mesma tela.
  const erp = useERPConectado()
  const ctx = use(OrderDetailContext)
  const retry = useRetryERPFinalisation()

  if (!ctx) return null
  const { order } = ctx.state
  const finalisation = order.erpFinalisation

  const sync = order.erpItemSync
  const syncNotice = sync?.pending ? (
    <div role="status" className="space-y-1 rounded-lg border bg-muted/40 p-4 print:hidden">
      <p className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw aria-hidden className={`size-4 ${sync.processing ? "animate-spin" : ""}`} />
        {sync.lastError ? "Sincronização aguardando nova tentativa" : "Alterações salvas · sincronizando com o ERP"}
      </p>
      <p className="text-sm text-muted-foreground">
        {sync.lastError
          ? "A última tentativa não foi concluída. O sistema tentará novamente automaticamente; você pode sair desta tela."
          : "Você pode sair desta tela. O andamento será atualizado automaticamente."}
        {" "}O pagamento fica disponível após a confirmação.
      </p>
    </div>
  ) : null
  const warnings = <>
    {syncNotice}
    {order.paymentReviewRequired || (!sync?.pending && (order.erpPendingItems ?? 0) > 0) ? (
    <div
      role="alert"
      className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 print:hidden"
    >
      {order.paymentReviewRequired && (
        <p className="text-sm font-medium">
          Pagamento recebido em conferência: a cobrança e o carrinho divergem.
          Confira os valores antes de liberar o pedido ou solicitar outro pagamento.
        </p>
      )}
      {(order.erpPendingItems ?? 0) > 0 && (
        <p className="text-sm">
          {order.erpPendingItems} item(ns) aguardam confirmação no {erp.nome}.
          A sincronização será retomada automaticamente. Confira a grade no ERP
          antes de separar a mercadoria.
        </p>
      )}
    </div>
  ) : null}
  </>

  if (order.paymentReviewRequired || !finalisation || finalisation.status !== "failed") {
    return warnings
  }

  const handleRetry = () => {
    retry.mutate(
      { id: order.id },
      {
        onSuccess: (refreshed) => {
          if (refreshed.erpFinalisation?.status === "done") {
            toast.success("Pedido aprovado no ERP")
          } else if (refreshed.erpFinalisation?.status === "failed") {
            toast.error(
              "O ERP recusou de novo. Confira a mensagem e contate o suporte se persistir.",
            )
          }
        },
        onError: () => {
          toast.error("Não foi possível tentar de novo agora")
        },
      },
    )
  }

  const attempts = finalisation.attemptsCount
  const lastAttempt = finalisation.lastAttemptAt

  return (
    <>
      {warnings}
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 print:hidden"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-destructive">
              Pedido pago, mas não foi aprovado no ERP
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A finalização no {erp.nome} está pendente. Confira a grade, o estoque e
              o pagamento no ERP. Tente novamente abaixo; se o erro persistir,
              contate o suporte.
            </p>
          </div>
        </div>

        {finalisation.lastError && (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-background/60 p-3 font-mono text-xs leading-relaxed text-foreground/80">
            {finalisation.lastError}
          </pre>
        )}

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            {formatAttemptCount(attempts)}
            {lastAttempt && (
              <>
                {" · "}
                <span>última em {formatDateTime(lastAttempt)}</span>
            </>
          )}
        </p>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRetry}
          disabled={retry.isPending}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`mr-2 h-3.5 w-3.5 ${retry.isPending ? "animate-spin" : ""}`}
            aria-hidden
          />
          {retry.isPending ? "Tentando…" : "Tentar novamente"}
        </Button>
      </div>
    </div>
    </>
  )
}
