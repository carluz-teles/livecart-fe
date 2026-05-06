import { apiClient } from "./client"
import type {
  NotificationSettings,
  UpdateNotificationSettingsPayload,
  PreviewTemplateResponse,
  AvailableVariablesResponse,
  TestRecipient,
  SendTestPayload,
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

  // Get available template variables
  getVariables: (storeId: string, token?: string | null) =>
    apiClient.get<AvailableVariablesResponse>(`/stores/${storeId}/notifications/variables`, token),

  // Test recipient: read current state (configured handle + active setup code)
  getTestRecipient: (storeId: string, token?: string | null) =>
    apiClient.get<TestRecipient>(`/stores/${storeId}/notifications/test/recipient`, token),

  // Test recipient: start setup — returns the magic code to DM from personal IG
  startTestSetup: (storeId: string, token?: string | null) =>
    apiClient.post<TestRecipient>(`/stores/${storeId}/notifications/test/setup`, {}, token),

  // Send a real test DM to the configured recipient
  sendTest: (storeId: string, payload: SendTestPayload, token?: string | null) =>
    apiClient.post<{ sent: boolean }>(`/stores/${storeId}/notifications/test`, payload, token),
}
