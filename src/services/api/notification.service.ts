import { apiClient } from "./client"
import type {
  NotificationSettings,
  UpdateNotificationSettingsPayload,
  PreviewTemplateResponse,
  AvailableVariablesResponse,
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
}
