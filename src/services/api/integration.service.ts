import { apiClient } from "./client"
import type {
  Integration,
  IntegrationListResponse,
  OAuthConnectResponse,
  CreateIntegrationPayload,
  IntegrationProvider,
  TestConnectionResponse,
} from "@/types/integration"

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

  // Get OAuth connect URL (for OAuth providers like Mercado Pago)
  getOAuthURL: (storeId: string, provider: IntegrationProvider, token?: string | null) =>
    apiClient.get<OAuthConnectResponse>(
      `/stores/${storeId}/integrations/oauth/${provider}/connect`,
      token
    ),

  // Test connection to an integration
  testConnection: (storeId: string, integrationId: string, token?: string | null) =>
    apiClient.post<TestConnectionResponse>(
      `/stores/${storeId}/integrations/${integrationId}/test`,
      {},
      token
    ),
}
