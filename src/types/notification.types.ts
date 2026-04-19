// Template settings for a notification type
export interface TemplateSettings {
  enabled: boolean
  on_first_item?: boolean // Only for checkout_immediate
  on_new_items?: boolean // Only for checkout_immediate
  cooldown_seconds?: number
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
