"use client"

import { Activity, AlertCircle, CheckCircle2, Link2 } from "lucide-react"
import type { Integration } from "@/types"
import { PROVIDERS } from "@/types/integration.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export function IntegrationOverview({
  integrations,
  onDetails,
}: {
  integrations: Integration[]
  onDetails: (integration: Integration) => void
}) {
  const configured = integrations.filter(
    (integration) => integration.status !== "disconnected",
  )
  const attention = configured.filter(
    (integration) =>
      integration.status !== "active" ||
      integration.webhookStatus === "pending",
  )
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="size-5" />
            Sua operação conectada
          </CardTitle>
          <Badge variant="outline">
            {
              configured.filter(
                (integration) => integration.status === "active",
              ).length
            }{" "}
            conexões ativas
          </Badge>
        </div>
        <CardDescription>
          Acompanhe os serviços que recebem suas vendas, movimentam o catálogo e
          cuidam das entregas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {configured.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Conecte seus serviços abaixo para começar.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {configured.map((integration) => {
              const pending =
                integration.status !== "active" ||
                integration.webhookStatus === "pending"
              const Icon = pending ? AlertCircle : CheckCircle2
              const name =
                PROVIDERS.find(
                  (provider) => provider.id === integration.provider,
                )?.name ??
                (integration.provider === "bling"
                  ? "Bling"
                  : integration.provider === "twilio_whatsapp"
                    ? "WhatsApp"
                    : integration.provider)
              const status =
                integration.status === "error"
                  ? "Verificar conexão"
                  : integration.status === "pending_auth"
                    ? "Concluir autorização"
                    : integration.webhookStatus === "pending"
                      ? "Configurar webhook"
                      : integration.erpResyncRunning
                        ? "Sincronizando produtos"
                        : "Conexão ativa"
              return (
                <Button
                  key={integration.id}
                  variant="outline"
                  className="h-auto justify-start gap-3 whitespace-normal p-3 text-left"
                  onClick={() => onDetails(integration)}
                >
                  <Icon aria-hidden="true" />
                  <span className="flex flex-col gap-1">
                    <span>{name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {status}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
        )}
        {attention.length > 0 && (
          <p className="flex items-start gap-2 text-sm">
            <Link2 className="mt-0.5 size-4 shrink-0" />
            {attention.length}{" "}
            {attention.length === 1 ? "serviço precisa" : "serviços precisam"}{" "}
            de atenção. Abra a conexão acima para conferir a configuração.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
