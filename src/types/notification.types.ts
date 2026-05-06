// Template settings for a notification type
// Triggers (when to send) are now in CartSettings
export interface TemplateSettings {
  enabled: boolean
  template: string
}

// Notification settings for a store
export interface NotificationSettings {
  checkout_immediate: TemplateSettings | null
  item_added: TemplateSettings | null
  checkout_reminder: TemplateSettings | null
}

// Request payload for updating notification settings
export interface UpdateNotificationSettingsPayload {
  checkout_immediate?: TemplateSettings | null
  item_added?: TemplateSettings | null
  checkout_reminder?: TemplateSettings | null
}

// Response for template preview
export interface PreviewTemplateResponse {
  preview: string
  byte_count: number
  max_bytes: number
  is_valid: boolean
  error?: string
}

// Variable info for template editor
export interface TemplateVariable {
  name: string
  description: string
  example: string
}

// Response for available variables
export interface AvailableVariablesResponse {
  variables: TemplateVariable[]
}

// Notification type identifiers — must match BE notification.NotificationType
export const NOTIFICATION_TYPES = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

// Test recipient state returned by GET /notifications/test/recipient
export interface TestRecipient {
  configured: boolean
  handle?: string
  setup_code?: string
  setup_expires_at?: string
  setup_code_active: boolean
}

// Payload for POST /notifications/test
export interface SendTestPayload {
  type: NotificationType
  template: string
}
