export type IntegrationType = "payment" | "erp" | "social" | "shipping"
export type IntegrationProvider =
  | "mercado_pago"
  | "pagarme"
  | "tiny"
  | "instagram"
  | "melhor_envio"
  | "smartenvios"
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

// List response now follows the standard paginated pattern
export interface IntegrationListResponse {
  data: Integration[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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

// ERP Product from search
export interface ERPProduct {
  id: string
  sku?: string
  name: string
  price: number // in cents
  stock: number
  imageUrl?: string
  active: boolean
}

export interface ERPProductSearchResponse {
  products: ERPProduct[]
  totalCount: number
  hasMore: boolean
}

// Instagram Live
export interface InstagramLive {
  id: string
  media_type: string
  media_product_type: string
  username: string
  timestamp?: string
}

export interface InstagramLivesResponse {
  data: InstagramLive[]
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
    description: "Receba pagamentos via Pix e cartão de crédito",
    icon: "/icons/mercado-pago.svg",
    supportsOAuth: true,
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    type: "payment",
    description: "Receba pagamentos via Pix e cartão de crédito",
    icon: "/icons/pagarme.svg",
    supportsOAuth: false,
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    type: "erp",
    description: "Sincronize produtos e pedidos com seu ERP",
    icon: "/icons/tiny.svg",
    supportsOAuth: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "social",
    description: "Receba comentários e mensagens de lives do Instagram",
    icon: "/icons/instagram.svg",
    supportsOAuth: true,
  },
  {
    id: "melhor_envio",
    name: "Melhor Envio",
    type: "shipping",
    description: "Cote frete no checkout com Correios, Jadlog e outras transportadoras",
    icon: "/icons/melhor-envio.svg",
    supportsOAuth: true,
  },
  {
    id: "smartenvios",
    name: "SmartEnvios",
    type: "shipping",
    description: "Cote frete e gerencie envios com Jadlog, Total Express e outras transportadoras",
    icon: "/icons/smartenvios.svg",
    supportsOAuth: false,
  },
]

export interface ConnectSmartEnviosPayload {
  token: string
  // Backend still requires the field, but the LiveCart UI only supports
  // production — there's no sandbox account to connect to.
  env: "production"
}

// A carrier service that the store's shipping embarcador has enabled for use.
// Returned by GET /integrations/shipping/:provider/carriers.
export interface ShippingCarrier {
  serviceId: string
  service: string
  carrier: string
  carrierLogoUrl?: string | null
  insuranceMaxCents: number
}
