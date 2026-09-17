import type { Integration, IntegrationType } from "@/types/integration.types"
import { PROVIDERS } from "@/types/integration.types"

export const integrationRoles: Record<IntegrationType, string> = {
  erp: "Produtos e estoque",
  payment: "Pagamentos",
  social: "Comentários e vendas",
  shipping: "Frete e entregas",
  communication: "Mensagens",
}

export function integrationName(integration: Integration) {
  return (
    PROVIDERS.find((provider) => provider.id === integration.provider)?.name ??
    ({ bling: "Bling", twilio_whatsapp: "WhatsApp" } as Record<string, string>)[
      integration.provider
    ] ??
    integration.provider
  )
}

export function integrationConnectionState(integration: Integration) {
  if (integration.status === "error") {
    return {
      kind: "error",
      label: "Revisar conexão",
      detail: "Abra os detalhes para verificar o acesso.",
      attention: true,
    } as const
  }
  if (integration.status === "pending_auth") {
    return {
      kind: "pending",
      label: "Autorizar acesso",
      detail: "A autorização ainda não foi concluída.",
      attention: true,
    } as const
  }
  if (integration.status === "disconnected") {
    return {
      kind: "disconnected",
      label: "Desconectado",
      detail: "Conecte este serviço para começar.",
      attention: false,
    } as const
  }
  if (integration.status !== "active") {
    return {
      kind: "pending",
      label: "Verificar status",
      detail: "Não foi possível confirmar o estado desta conexão.",
      attention: true,
    } as const
  }
  if (integration.webhookStatus === "pending") {
    return {
      kind: "pending",
      label: "Verificar notificações",
      detail: "Acesso conectado; aguardando a primeira notificação do serviço.",
      attention: true,
    } as const
  }
  if (integration.erpResyncRunning) {
    return {
      kind: "syncing",
      label: "Sincronizando",
      detail: "Atualização do catálogo em andamento.",
      attention: false,
    } as const
  }
  return {
    kind: "active",
    label: "Conectado",
    detail: "Acesso autorizado ao serviço.",
    attention: false,
  } as const
}

export function integrationOverview(integrations: Integration[]) {
  const configured = integrations.filter(
    (integration) => integration.status !== "disconnected",
  )
  return {
    configured: [...configured].sort(
      (a, b) =>
        Number(integrationConnectionState(b).attention) -
        Number(integrationConnectionState(a).attention),
    ),
    activeCount: configured.filter(
      (integration) => integration.status === "active",
    ).length,
    attentionCount: configured.filter(
      (integration) => integrationConnectionState(integration).attention,
    ).length,
  }
}
