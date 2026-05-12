"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePagarmeWebhookStatus } from "@/hooks/integration"
import type { PagarmeWebhookStatus } from "@/types"

interface PagarmeWebhookProbeProps {
  integrationId: string
}

// Lightweight panel that queries Pagar.me's recent webhook deliveries to
// confirm the merchant wired our URL in their dashboard. Three states:
//
//   - never delivered → amber "configure no painel"
//   - delivered + last response 2xx → green "webhook ativo"
//   - delivered + last response 4xx/5xx → red "última entrega falhou"
//
// The query is cheap (Pagar.me limits us to 50 hooks/min) and stays cached
// for 30s, so opening the sheet multiple times in a row won't hammer the API.
export function PagarmeWebhookProbe({ integrationId }: PagarmeWebhookProbeProps) {
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
              Webhook ainda não configurado
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
              Não recebemos nenhuma entrega desta loja no histórico recente da
              Pagar.me. Cadastre a URL no painel da Pagar.me em{" "}
              <strong>Configurações → Webhooks</strong>.
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
