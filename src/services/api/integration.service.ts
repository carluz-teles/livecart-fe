import { apiClient } from "./client"
import type {
  Integration,
  IntegrationListResponse,
  OAuthConnectResponse,
  CreateIntegrationPayload,
  IntegrationProvider,
  TestConnectionResponse,
  ERPProductSearchResponse,
  ImportERPProductResponse,
  Product,
  InstagramLivesResponse,
  ConnectSmartEnviosPayload,
  ConnectPagarmePayload,
  PagarmeWebhookStatus,
  ProviderURLs,
  ERPHealthCheckResponse,
} from "@/types"

export const integrationService = {
  // List all integrations for a store
  list: (storeId: string, token?: string | null) =>
    apiClient.get<IntegrationListResponse>(`/stores/${storeId}/integrations`, token),

  // Get a single integration
  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<Integration>(`/stores/${storeId}/integrations/${id}`, token),

  // Create integration (for non-OAuth providers like Tiny)
  create: (storeId: string, payload: CreateIntegrationPayload, token?: string | null) =>
    apiClient.post<Integration>(`/stores/${storeId}/integrations`, payload, token),

  // Delete/disconnect an integration
  delete: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/integrations/${id}`, token),

  // Reorders integrations within a store. Lower priority wins the checkout
  // selection; the admin UI surfaces this for payment providers when 2+ are
  // connected (Mercado Pago + Pagar.me, etc.).
  updatePriority: (
    storeId: string,
    id: string,
    priority: number,
    token?: string | null,
  ) =>
    apiClient.patch<{ id: string; priority: number }>(
      `/stores/${storeId}/integrations/${id}/priority`,
      { priority },
      token,
    ),

  // Get OAuth connect URL (for OAuth providers like Mercado Pago)
  getOAuthURL: (storeId: string, provider: IntegrationProvider, token?: string | null) =>
    apiClient.get<OAuthConnectResponse>(
      `/stores/${storeId}/integrations/oauth/${provider}/connect`,
      token
    ),

  // Setup URLs that the merchant must register inside the provider's app
  // (OAuth callback + webhook). Backend returns 422 for providers that
  // don't expose these — call only for providers that need them (Tiny).
  getProviderURLs: (storeId: string, provider: IntegrationProvider, token?: string | null) =>
    apiClient.get<ProviderURLs>(
      `/stores/${storeId}/integrations/providers/${provider}/urls`,
      token
    ),

  // Test connection to an integration
  testConnection: (storeId: string, integrationId: string, token?: string | null) =>
    apiClient.post<TestConnectionResponse>(
      `/stores/${storeId}/integrations/${integrationId}/test`,
      {},
      token
    ),

  // ERP cadastro audit (Tiny v3 today). Returns supported=false when the
  // underlying ERP doesn't expose the audit capability — the caller should
  // hide the section, not show an empty "all good" state.
  runERPHealthCheck: (storeId: string, integrationId: string, token?: string | null) =>
    apiClient.get<ERPHealthCheckResponse>(
      `/stores/${storeId}/integrations/${integrationId}/erp/health-check`,
      token
    ),

  // Search products in an ERP integration
  searchProducts: (
    storeId: string,
    integrationId: string,
    search: string,
    token?: string | null
  ) =>
    apiClient.get<ERPProductSearchResponse>(
      `/stores/${storeId}/integrations/${integrationId}/products?search=${encodeURIComponent(search)}`,
      token
    ),

  // Sync a single product from ERP
  syncProduct: (
    storeId: string,
    integrationId: string,
    productId: string,
    token?: string | null
  ) =>
    apiClient.post<Product>(
      `/stores/${storeId}/integrations/${integrationId}/products/${productId}/sync`,
      {},
      token
    ),

  // Import a Tiny product (or a subset of its variants) into the LiveCart
  // catalog. The backend creates a product_group + N products atomically
  // when there are variants, or a single product for flat items.
  importProduct: (
    storeId: string,
    integrationId: string,
    tinyProductId: string,
    variantIds: string[] | undefined,
    token?: string | null
  ) =>
    apiClient.post<ImportERPProductResponse>(
      `/stores/${storeId}/integrations/${integrationId}/products/${tinyProductId}/import`,
      variantIds && variantIds.length > 0 ? { variantIds } : {},
      token
    ),

  // Get active Instagram lives
  getInstagramLives: (storeId: string, token?: string | null) =>
    apiClient.get<InstagramLivesResponse>(
      `/stores/${storeId}/integrations/instagram/lives`,
      token
    ),

  // Connect or rotate SmartEnvios token. Backend validates the token against
  // the provider in real time — 422 means the token is invalid.
  connectSmartEnvios: (
    storeId: string,
    payload: ConnectSmartEnviosPayload,
    token?: string | null
  ) =>
    apiClient.post<Integration>(
      `/stores/${storeId}/integrations/shipping/smartenvios/connect`,
      payload,
      token
    ),

  // Connect or rotate Pagar.me API keys. Backend validates the secret
  // against /customers in real time — 422 means the keys are invalid.
  connectPagarme: (
    storeId: string,
    payload: ConnectPagarmePayload,
    token?: string | null
  ) =>
    apiClient.post<Integration>(
      `/stores/${storeId}/integrations/payment/pagarme/connect`,
      payload,
      token
    ),

  // Reads Pagar.me's recent delivery history (no public API to list
  // subscriptions, so we infer "configured" from a matching URL). Returns
  // configured=false when no recent delivery hit our endpoint.
  getPagarmeWebhookStatus: (
    storeId: string,
    integrationId: string,
    token?: string | null
  ) =>
    apiClient.get<PagarmeWebhookStatus>(
      `/stores/${storeId}/integrations/${integrationId}/pagarme/webhook-status`,
      token
    ),
}
