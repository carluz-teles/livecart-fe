"use client"

import Link from "next/link"
import { Database, RefreshCw } from "lucide-react"
import { useERPResyncRunning } from "@/hooks/integration"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QueryFeedback } from "@/components/shared/QueryFeedback"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function integrationDate(value?: string | null) {
  if (!value) return "Ainda não registrada"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Data indisponível"
    : new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date)
}

export function ERPResyncStatus() {
  const {
    integration,
    running,
    done,
    total,
    error,
    isPending,
    isFetching,
    refetch,
  } = useERPResyncRunning()
  if (error)
    return (
      <QueryFeedback
        title="Não foi possível consultar o estado da sincronização"
        stale={!!integration}
        retry={() => void refetch()}
        busy={isFetching}
      />
    )
  if (!integration || isPending) return null
  if (!running)
    return (
      <Alert role="status">
        <Database className="size-4" aria-hidden="true" />
        <AlertTitle>Sem sincronização em andamento</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs">
            Última sincronização registrada:{" "}
            {integrationDate(integration.lastSyncedAt)}.
          </p>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings/integrations?tab=erp">
              Ver integração e diagnóstico
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  const progress =
    total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : null
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4" />
            Sincronização do catálogo
          </CardTitle>
          <Badge variant="outline">
            {running ? "Em andamento" : "Sem sincronização em andamento"}
          </Badge>
        </div>
        <CardDescription>
          {running
            ? "Atualizando preço, estoque disponível e dados de envio no ritmo permitido pelo ERP."
            : `Última sincronização registrada pela integração: ${integrationDate(integration.lastSyncedAt)}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {running && (
          <>
            <div role="status" className="flex items-center gap-2 text-sm">
              <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
              {total > 0
                ? `${done} de ${total} produtos processados`
                : "Preparando a sincronização…"}
            </div>
            <Progress
              value={progress}
              aria-label="Progresso da sincronização"
            />
            <p className="text-xs text-muted-foreground">
              O progresso é atualizado automaticamente. Produtos processados
              podem incluir itens com falha.
            </p>
          </>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            A lista é atualizada ao encerrar o processamento. Confira os
            produtos com pendências.
          </p>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings/integrations?tab=erp">
              Ver integração e diagnóstico
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
