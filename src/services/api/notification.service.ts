import { apiClient } from "./client"
import type {
  NotificationSettings,
  UpdateNotificationSettingsPayload,
  PreviewTemplateResponse,
  AvailableVariablesResponse,
  TestRecipient,
  SendTestPayload,
  SendTestEmailPayload,
} from "@/types/notification.types"

export const notificationService = {
  // Get notification settings for a store
  getSettings: (storeId: string, token?: string | null) =>
    apiClient.get<NotificationSettings>(`/stores/${storeId}/notifications/settings`, token),

  // Update notification settings for a store
  updateSettings: (storeId: string, payload: UpdateNotificationSettingsPayload, token?: string | null) =>
    apiClient.put<NotificationSettings>(`/stores/${storeId}/notifications/settings`, payload, token),

  // Preview a template with sample data
  previewTemplate: (storeId: string, template: string, token?: string | null) =>
    apiClient.post<PreviewTemplateResponse>(`/stores/${storeId}/notifications/preview`, { template }, token),

  // Get available template variables. When templateType is provided, the
  // backend scopes the catalog to that template's variables (compat: omit
  // the param to receive every variable).
  getVariables: (storeId: string, token?: string | null, templateType?: string) =>
    apiClient.get<AvailableVariablesResponse>(
      `/stores/${storeId}/notifications/variables${
        templateType ? `?type=${encodeURIComponent(templateType)}` : ""
      }`,
      token,
    ),

  // Test recipient: read current state (configured handle + active setup code)
  getTestRecipient: (storeId: string, token?: string | null) =>
    apiClient.get<TestRecipient>(`/stores/${storeId}/notifications/test/recipient`, token),

  // Test recipient: start setup — returns the magic code to DM from personal IG
  startTestSetup: (storeId: string, token?: string | null) =>
    apiClient.post<TestRecipient>(`/stores/${storeId}/notifications/test/setup`, {}, token),

  // Send a real test DM to the configured recipient
  sendTest: (storeId: string, payload: SendTestPayload, token?: string | null) =>
    apiClient.post<{ sent: boolean }>(`/stores/${storeId}/notifications/test`, payload, token),

  // Send a real test email rendered through the override shell to an
  // arbitrary address (the FE auto-fills the lojista's Clerk email).
  sendTestEmail: (
    storeId: string,
    payload: SendTestEmailPayload,
    token?: string | null,
  ) =>
    apiClient.post<{ sent: boolean }>(
      `/stores/${storeId}/notifications/test/email`,
      payload,
      token,
    ),
}
