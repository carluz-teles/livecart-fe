"use client"

import { use } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useRetryERPFinalisation } from "@/hooks/order"
import { formatDateTime } from "@/lib/format"

import { OrderDetailContext } from "./OrderDetailContext"

// Surfaces a paid cart whose post-payment Tiny order creation failed. The
// stock stays held against the cart on the backend (re-reserved on failure),
// so the merchant has a true "retry" instead of having to figure out
// reconciliation. Hidden in the happy path — only renders when status is
// "failed".
export function OrderDetailERPRetryBanner() {
  const ctx = use(OrderDetailContext)
  const retry = useRetryERPFinalisation()

  if (!ctx) return null
  const { order } = ctx.state
  const finalisation = order.erpFinalisation

  if (!finalisation || finalisation.status !== "failed") return null

  const handleRetry = () => {
    retry.mutate(
      { id: order.id },
      {
        onSuccess: (refreshed) => {
          if (refreshed.erpFinalisation?.status === "done") {
            toast.success("Pedido enviado para o ERP com sucesso")
          } else if (refreshed.erpFinalisation?.status === "failed") {
            toast.error(
              "O ERP rejeitou o pedido novamente. Confira a mensagem e contate o suporte se persistir.",
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
            Pedido pago, mas não foi enviado para o ERP
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            O estoque continua reservado para esse pedido no ERP — nenhuma
            unidade foi liberada. Tente reenviar abaixo. Se o erro persistir
            após algumas tentativas, contate o suporte.
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
          {attempts === 1 ? "1 tentativa" : `${attempts} tentativas`}
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
  )
}
