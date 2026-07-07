// Template settings for a notification type
// Triggers (when to send) are now in CartSettings
export interface TemplateSettings {
  enabled: boolean
  template: string
}

// Email-channel template (post-payment notifications). Subject and body_html
// can be empty — empty means "use the BE default for this type".
export interface EmailTemplateSettings {
  enabled: boolean
  subject: string
  body_html: string
}

// WhatsApp cart recovery (PRD 006). The template shown here is
// informational — the message actually sent is the Meta-approved content
// template registered on the Twilio side.
export interface CartRecoverySettings {
  enabled: boolean
  delay_minutes: number
  max_attempts: number
  quiet_hours_start: number
  quiet_hours_end: number
  recover_ended_events: boolean
  template: string
}

// Notification settings for a store
export interface NotificationSettings {
  checkout_immediate: TemplateSettings | null
  item_added: TemplateSettings | null
  checkout_reminder: TemplateSettings | null
  payment_confirmed?: EmailTemplateSettings | null
  shipped?: EmailTemplateSettings | null
  delivered?: EmailTemplateSettings | null
  cart_recovery?: CartRecoverySettings | null
}

// Request payload for updating notification settings
export interface UpdateNotificationSettingsPayload {
  checkout_immediate?: TemplateSettings | null
  item_added?: TemplateSettings | null
  checkout_reminder?: TemplateSettings | null
  payment_confirmed?: EmailTemplateSettings | null
  shipped?: EmailTemplateSettings | null
  delivered?: EmailTemplateSettings | null
  cart_recovery?: CartRecoverySettings | null
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

// Cart-flow notifications go through Instagram DM (the original 3 templates).
export const CART_NOTIFICATION_TYPES = [
  "checkout_immediate",
  "item_added",
  "checkout_reminder",
] as const
export type CartNotificationType = (typeof CART_NOTIFICATION_TYPES)[number]

// Post-payment notifications go through email. Subject + body_html shape.
export const POST_PAYMENT_NOTIFICATION_TYPES = [
  "payment_confirmed",
  "shipped",
  "delivered",
] as const
export type PostPaymentNotificationType =
  (typeof POST_PAYMENT_NOTIFICATION_TYPES)[number]

// Combined union for the FE editor.
export const NOTIFICATION_TYPES = [
  ...CART_NOTIFICATION_TYPES,
  ...POST_PAYMENT_NOTIFICATION_TYPES,
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const POST_PAYMENT_TYPE_SET: Set<string> = new Set(
  POST_PAYMENT_NOTIFICATION_TYPES,
)
export function isPostPaymentType(type: string): type is PostPaymentNotificationType {
  return POST_PAYMENT_TYPE_SET.has(type)
}

// Test recipient state returned by GET /notifications/test/recipient
export interface TestRecipient {
  configured: boolean
  handle?: string
  setup_code?: string
  setup_expires_at?: string
  setup_code_active: boolean
}

// Payload for POST /notifications/test (Instagram DM channel).
export interface SendTestPayload {
  type: NotificationType
  template: string
}

// Payload for POST /notifications/test/email (email channel).
export interface SendTestEmailPayload {
  type: PostPaymentNotificationType
  subject: string
  body_html: string
  recipient_email: string
}
