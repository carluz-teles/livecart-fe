"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Wifi,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePagarmeWebhookStatus, useTestPagarmeWebhook } from "@/hooks/integration"
import type { PagarmeWebhookStatus } from "@/types"

interface PagarmeWebhookProbeProps {
  integrationId: string
}

// Two complementary checks stacked together:
//
//   1. Delivery-history probe (reads Pagar.me's /hooks) — proves the merchant
//      wired our URL AND that real events are landing. Only meaningful once at
//      least one delivery has happened.
//   2. Loopback self-test (POSTs to our own URL) — proves the LiveCart side is
//      reachable/healthy WITHOUT waiting for a sale. Fills the gap the history
//      probe can't: a freshly-configured store with no orders yet.
export function PagarmeWebhookProbe({ integrationId }: PagarmeWebhookProbeProps) {
  return (
    <div className="space-y-3">
      <PagarmeWebhookHistory integrationId={integrationId} />
      <PagarmeWebhookSelfTest integrationId={integrationId} />
    </div>
  )
}

function PagarmeWebhookHistory({ integrationId }: PagarmeWebhookProbeProps) {
  const { data, isLoading, isError, refetch, isRefetching } =
    usePagarmeWebhookStatus(integrationId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Consultando histórico na Pagar.me...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">Não foi possível consultar a Pagar.me</p>
          <p className="text-xs">
            Confira se a chave secreta está válida e tente novamente.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  return <PagarmeWebhookProbeContent status={data} onRefresh={refetch} refreshing={isRefetching} />
}

interface ContentProps {
  status: PagarmeWebhookStatus
  onRefresh: () => void
  refreshing: boolean
}

function PagarmeWebhookProbeContent({ status, onRefresh, refreshing }: ContentProps) {
  const { configured, lastDeliveryAt, lastResponseStatus, lastEvent, matchCount } = status

  if (!configured) {
    return (
      <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Nenhuma entrega recebida ainda
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
              A Pagar.me ainda não entregou nenhum evento desta loja no histórico
              recente. Isso é normal se você acabou de configurar ou ainda não
              houve vendas. Cadastre a URL no painel da Pagar.me em{" "}
              <strong>Configurações → Webhooks</strong> e use o teste abaixo para
              validar o endpoint sem esperar uma compra.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  const healthy = lastResponseStatus >= 200 && lastResponseStatus < 300
  const lastAttempt = lastDeliveryAt
    ? formatDistanceToNow(new Date(lastDeliveryAt), { addSuffix: true, locale: ptBR })
    : null

  return (
    <div
      className={
        healthy
          ? "space-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3"
          : "space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3"
      }
    >
      <div className="flex items-start gap-2">
        {healthy ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
        )}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">
            {healthy ? "Webhook ativo na Pagar.me" : "Webhook está falhando"}
          </p>
          <p className="text-xs text-muted-foreground">
            {matchCount} entrega{matchCount === 1 ? "" : "s"} no histórico recente
            {lastAttempt ? ` · última ${lastAttempt}` : null}
          </p>
          {lastEvent && (
            <p className="text-xs">
              <span className="text-muted-foreground">Último evento:</span>{" "}
              <code className="rounded bg-muted px-1 text-[10px]">{lastEvent}</code>
              {lastResponseStatus > 0 && (
                <>
                  {" "}
                  <span className="text-muted-foreground">· status:</span>{" "}
                  <code className="rounded bg-muted px-1 text-[10px]">
                    HTTP {lastResponseStatus}
                  </code>
                </>
              )}
            </p>
          )}
          {!healthy && (
            <p className="text-xs text-destructive">
              A Pagar.me está entregando os eventos, mas nosso endpoint
              respondeu com erro. Verifique se as credenciais Basic Auth no
              webhook estão iguais às cadastradas aqui.
            </p>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

// Loopback self-test: fires an on-demand POST from our server to our own public
// webhook URL. Confirms the endpoint is reachable and returns 200 — proving the
// LiveCart side is ready even before any real Pagar.me delivery exists.
function PagarmeWebhookSelfTest({ integrationId }: PagarmeWebhookProbeProps) {
  const { mutate, data, isPending, isError, reset } = useTestPagarmeWebhook(integrationId)

  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex items-start gap-2">
        <Wifi className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Testar nosso endpoint agora</p>
          <p className="text-xs text-muted-foreground">
            Enviamos um evento de teste para a própria URL do LiveCart e
            confirmamos que ela está no ar e respondendo — sem precisar de uma
            venda.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            reset()
            mutate()
          }}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            "Testar agora"
          )}
        </Button>
      </div>

      {isError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Não foi possível executar o teste. Verifique a conexão e tente
            novamente.
          </span>
        </div>
      )}

      {data && (
        <div
          className={
            data.reachable && data.healthy
              ? "flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-200"
              : "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          }
        >
          {data.reachable && data.healthy ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          )}
          <div className="flex-1 space-y-1">
            <p>{data.message}</p>
            <p className="opacity-80">
              {data.reachable && `${data.latencyMs}ms`}
              {data.httpStatus > 0 && ` · HTTP ${data.httpStatus}`}
              {" · "}
              {data.authConfigured
                ? "Basic Auth ativo"
                : "sem Basic Auth"}
            </p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Isto valida o lado do LiveCart. Confirme também que a URL colada no
        painel da Pagar.me é idêntica à exibida acima.
      </p>
    </div>
  )
}
