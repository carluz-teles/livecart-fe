import type { ERPHealthCheckItem, Integration, IntegrationType } from "@/types/integration.types"
import { PROVIDERS } from "@/types/integration.types"

export function erpHealthCheckSummary(items: ERPHealthCheckItem[]) {
  const missingCount = items.filter(item => item.status === "missing").length
  const unknownCount = items.filter(item => item.status === "unknown").length
  return {
    missingCount,
    totalCount: items.length,
    allOk: items.length > 0 && items.every(item => item.status === "ok"),
    unverifiedMessage: unknownCount === 0 ? null : unknownCount === 1
      ? "1 cadastro não pôde ser verificado. Tente novamente."
      : `${unknownCount} cadastros não puderam ser verificados. Tente novamente.`,
  }
}

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
  if (integration.metadata?.tokenRefreshFailure) {
    return {
      kind: "error",
      label: "Verificar autenticação",
      detail: "O provedor recusou a renovação do acesso. Há uma nova tentativa programada; abra os detalhes para verificar a conexão.",
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
