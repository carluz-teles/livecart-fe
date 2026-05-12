import type { PackageFormat } from "./product.types"

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
  // Setup URLs the merchant must paste into the provider's app to complete
  // OAuth and receive webhooks. Only populated for providers that require
  // them (currently Tiny).
  redirectUrl?: string
  webhookUrl?: string
  // Webhook health. "pending" until the provider hits the URL for the first
  // time (Tiny sends a validation ping as soon as the URL is saved in their
  // app). Always present whenever webhookUrl is set.
  webhookStatus?: "active" | "pending"
  // ISO-8601 of the last webhook ping received from the provider. Null
  // until the first ping arrives. Always emitted whenever webhookUrl is set.
  webhookLastPingAt?: string | null
  // Order used when a store has multiple integrations of the same type
  // (currently only payment). Lower = primary; checkout walks ascending.
  priority: number
}

// Response from GET /stores/:storeId/integrations/providers/:provider/urls.
// Use this BEFORE creating the integration to display the URLs the merchant
// must register in the provider's app. Backend returns 422 for providers
// that don't expose setup URLs.
export interface ProviderURLs {
  provider: IntegrationProvider
  redirectUrl?: string
  webhookUrl?: string
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

// Categories LiveCart audits inside the merchant's ERP. Each category maps
// to a different cadastro screen in the ERP UI, surfaced via PanelPath.
export type ERPHealthCheckCategory =
  | "forma_pagamento"
  | "forma_recebimento"
  | "forma_envio"

export type ERPHealthCheckStatus = "ok" | "missing"

export interface ERPHealthCheckItem {
  category: ERPHealthCheckCategory
  expected_name: string
  status: ERPHealthCheckStatus
  matched_id?: number
  matched_name?: string
  description: string
  panel_path: string
}

// Wrapper bundles the per-item audit + a flag the backend uses to signal
// that the underlying ERP doesn't expose the audit endpoints (in which
// case the FE should hide the section silently rather than show "all OK").
export interface ERPHealthCheckResponse {
  supported: boolean
  checkedAt: string
  items: ERPHealthCheckItem[]
}

export interface CreateIntegrationPayload {
  type: IntegrationType
  provider: IntegrationProvider
  credentials: Record<string, string>
  metadata?: Record<string, unknown>
}

// Shipping profile slice the ERP search exposes per product / variant.
// Narrower than the catalog's ShippingProfile — backend doesn't echo
// LiveCart-only fields (sku, insurance) on this surface. May be missing
// or partial when the ERP itself doesn't have all four dims registered.
export interface ERPShippingProfile {
  weightGrams: number
  heightCm: number
  widthCm: number
  lengthCm: number
  packageFormat: PackageFormat
}

// One variant of a parent product as returned by the ERP search. Attributes
// is a free-form dict (e.g. { Cor: "Preto", Tamanho: "P" }) — the keys come
// from the ERP's grade definition, so the frontend just renders them as
// labelled pills without assuming specific names.
export interface ERPVariant {
  id: string
  sku?: string
  price: number // cents
  stock: number
  active: boolean
  imageUrl?: string
  attributes: Record<string, string>
  shipping?: ERPShippingProfile
}

// ERP Product from search. When the underlying ERP product is a variant
// parent, isParent is true and variants[] is populated; the parent itself
// is not directly importable — the user must pick which variants to bring
// in via /integrations/:id/products/:tinyProductId/import.
export interface ERPProduct {
  id: string
  sku?: string
  name: string
  price: number // cents
  stock: number
  imageUrl?: string
  active: boolean
  isParent?: boolean
  variants?: ERPVariant[]
  shipping?: ERPShippingProfile
}

export interface ERPProductSearchResponse {
  products: ERPProduct[]
  totalCount: number
  hasMore: boolean
}

export interface ImportERPProductPayload {
  // Omitted or empty array imports every variant. Pass a subset when the
  // user only wants specific Tiny variant ids.
  variantIds?: string[]
}

// One row in the response's imported[] — echoes what the backend actually
// persisted (useful when the server imports fewer than we asked for).
export interface ImportedERPVariant {
  externalId: string
  sku: string
  attributes: Record<string, string>
}

export interface ImportERPProductResponse {
  // Set when the imported Tiny product is a variant parent.
  groupId?: string
  // Set when the imported Tiny product is simple (no variants).
  productId?: string
  isParent: boolean
  // Always present — empty array for simple products (the simple path
  // returns productId only).
  imported: ImportedERPVariant[]
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
    description: "Sincronize produtos e pedidos do Tiny (atual Olist)",
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

export interface ConnectPagarmePayload {
  secretKey: string
  publicKey: string
  // Optional Basic Auth credentials the merchant configured on the
  // Pagar.me webhook URL — used to validate inbound notifications.
  webhookUsername?: string
  webhookPassword?: string
}

// Pagar.me v5 has no public API to list webhook subscriptions, so this
// status is inferred from recent delivery history (GET /hooks). configured
// is true whenever at least one recent event was delivered to our URL;
// lastResponseStatus surfaces what our endpoint answered so the UI can warn
// when the URL is wired but delivering 401/5xx.
export interface PagarmeWebhookStatus {
  expectedUrl: string
  configured: boolean
  matchCount: number
  lastDeliveryAt: string | null
  lastDeliveryStatus: "" | "sent" | "failed" | "pending"
  lastResponseStatus: number
  lastEvent: string
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
