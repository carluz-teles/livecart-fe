export type IntegrationType = "payment" | "erp"
export type IntegrationProvider = "mercado_pago" | "tiny"
export type IntegrationStatus = "pending_auth" | "active" | "error" | "disconnected"

export interface Integration {
  id: string
  storeId: string
  type: IntegrationType
  provider: IntegrationProvider
  status: IntegrationStatus
  metadata?: Record<string, unknown>
  lastSyncedAt?: string
  createdAt: string
}

export interface IntegrationListResponse {
  integrations: Integration[]
}

export interface OAuthConnectResponse {
  authUrl: string
  state: string
}

export interface TestConnectionResponse {
  success: boolean
  message: string
  latencyMs: number
  accountInfo?: Record<string, unknown>
  testedAt: string
}

export interface CreateIntegrationPayload {
  type: IntegrationType
  provider: IntegrationProvider
  credentials: Record<string, string>
  metadata?: Record<string, unknown>
}

// Provider display info
export interface ProviderInfo {
  id: IntegrationProvider
  name: string
  type: IntegrationType
  description: string
  icon: string
  supportsOAuth: boolean
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    type: "payment",
    description: "Receba pagamentos via Pix, cartão e boleto",
    icon: "/icons/mercado-pago.svg",
    supportsOAuth: true,
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    type: "erp",
    description: "Sincronize produtos e pedidos com seu ERP",
    icon: "/icons/tiny.svg",
    supportsOAuth: false,
  },
]
