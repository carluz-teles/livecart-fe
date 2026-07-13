"use client"

import { useEffect, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  usePagarmeWebhookStatus,
  useTestPagarmeWebhook,
  useRunPagarmeWebhookLiveTest,
} from "@/hooks/integration"
import type { PagarmeWebhookStatus } from "@/types"

interface PagarmeWebhookProbeProps {
  integrationId: string
}

interface PagarmeWebhookRealTestProps {
  integrationId: string
  // When true (sheet opened right after connecting), fire the test once on
  // mount so the merchant gets an immediate verdict without clicking.
  autoRun?: boolean
}

// Three complementary checks, most-conclusive first:
//
//   1. Real end-to-end test (creates a throwaway order so Pagar.me fires a REAL
//      webhook) — the only check that proves the actual delivery path from the
//      merchant's dashboard config to our endpoint, on demand, without a sale.
//   2. Delivery-history probe (reads Pagar.me's /hooks) — passive confirmation
//      that real events have been landing. Only meaningful after a delivery.
//   3. Loopback self-test (POSTs to our own URL) — quick check that just our
//      side is up. Secondary, since it doesn't exercise the Pagar.me config.
export function PagarmeWebhookProbe({
  integrationId,
  autoRunLiveTest,
}: PagarmeWebhookProbeProps & { autoRunLiveTest?: boolean }) {
  return (
    <div className="space-y-3">
      <PagarmeWebhookRealTest integrationId={integrationId} autoRun={autoRunLiveTest} />
      <PagarmeWebhookHistory integrationId={integrationId} />
      <PagarmeWebhookLoopbackTest integrationId={integrationId} />
    </div>
  )
}

// The real one: triggers an actual Pagar.me webhook via a throwaway order and
// confirms it reached us. This is what proves the merchant wired it correctly.
function PagarmeWebhookRealTest({ integrationId, autoRun }: PagarmeWebhookRealTestProps) {
  const { mutate, data, isPending, isError, reset } =
    useRunPagarmeWebhookLiveTest(integrationId)

  // Fire once on mount when opened right after connecting. The ref guards
  // against React StrictMode's double-invoke and re-renders.
  const autoRanRef = useRef(false)
  useEffect(() => {
    if (autoRun && !autoRanRef.current) {
      autoRanRef.current = true
      mutate()
    }
  }, [autoRun, mutate])

  return (
    <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-2">
        <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Testar webhook de verdade</p>
          <p className="text-xs text-muted-foreground">
            Dispara um webhook real (com um pedido de teste de R$ 1, cancelado na
            hora) e confirma que chegou. Sem precisar de uma venda.
          </p>
        </div>
        <Button
          size="sm"
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

      {isPending && (
        <p className="text-[11px] text-muted-foreground">
          Aguardando a Pagar.me entregar o evento — pode levar até ~20 segundos.
        </p>
      )}

      {isError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Não foi possível executar o teste. Verifique se a chave da Pagar.me é
            válida e se a conta aceita PIX, e tente novamente.
          </span>
        </div>
      )}

      {data && (
        <RealTestResult
          delivered={data.delivered}
          healthy={data.healthy}
          message={data.message}
          event={data.event}
          httpStatus={data.httpStatus}
          responseRaw={data.responseRaw}
        />
      )}
    </div>
  )
}

interface RealTestResultProps {
  delivered: boolean
  healthy: boolean
  message: string
  event: string
  httpStatus: number
  responseRaw: string
}

function RealTestResult({
  delivered,
  healthy,
  message,
  event,
  httpStatus,
  responseRaw,
}: RealTestResultProps) {
  const tone = healthy
    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200"
    : delivered
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200"

  const Icon = healthy ? CheckCircle2 : delivered ? XCircle : AlertTriangle
  const iconColor = healthy
    ? "text-emerald-600"
    : delivered
      ? "text-destructive"
      : "text-amber-600"

  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${tone}`}>
      <Icon className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 space-y-1">
        <p>{message}</p>
        {(event || httpStatus > 0) && (
          <p className="opacity-80">
            {event && (
              <>
                evento{" "}
                <code className="rounded bg-black/5 px-1 dark:bg-white/10">
                  {event}
                </code>
              </>
            )}
            {httpStatus > 0 && ` · HTTP ${httpStatus}`}
          </p>
        )}
        {!healthy && responseRaw && (
          <p className="opacity-80">
            Resposta do endpoint:{" "}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">
              {responseRaw.slice(0, 140)}
            </code>
          </p>
        )}
      </div>
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
              houve vendas — use o teste acima para validar sem esperar uma
              compra.
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

// Secondary, quick check: POSTs to our own public URL to confirm just the
// LiveCart side is up. Does not exercise the Pagar.me dashboard config, so it's
// a fallback for when the real test can't run (e.g. account without PIX).
function PagarmeWebhookLoopbackTest({ integrationId }: PagarmeWebhookProbeProps) {
  const { mutate, data, isPending, isError, reset } = useTestPagarmeWebhook(integrationId)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Só quer checar se o nosso endpoint está no ar?
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => {
            reset()
            mutate()
          }}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Checando...
            </>
          ) : (
            "Checar nosso endpoint"
          )}
        </Button>
      </div>

      {isError && (
        <p className="text-[11px] text-destructive">
          Não foi possível executar a checagem. Tente novamente.
        </p>
      )}

      {data && (
        <div
          className={
            data.reachable && data.healthy
              ? "flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-900 dark:text-emerald-200"
              : "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px] text-destructive"
          }
        >
          {data.reachable && data.healthy ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span className="flex-1">
            {data.message}
            {data.reachable && ` (${data.latencyMs}ms)`}
          </span>
        </div>
      )}
    </div>
  )
}
