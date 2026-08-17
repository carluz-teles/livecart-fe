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
  // Os cinco gatilhos da RN-28 mais o waitlist_notified. Este era o buraco que
  // deixava `waitlist_notified` existir no domínio há meses sem nenhuma UI
  // conseguir ler ou escrever: chave sem entrada aqui é chave morta.
  out_of_window_scheduled?: TemplateSettings | null
  out_of_window_session_ended?: TemplateSettings | null
  out_of_window_event_ended?: TemplateSettings | null
  event_deadline_started?: TemplateSettings | null
  waitlist_unfulfilled?: TemplateSettings | null
  waitlist_joined?: TemplateSettings | null
  payment_confirmed?: EmailTemplateSettings | null
  shipped?: EmailTemplateSettings | null
  delivered?: EmailTemplateSettings | null
  payment_cancelled?: EmailTemplateSettings | null
  payment_refunded?: EmailTemplateSettings | null
  cart_recovery?: CartRecoverySettings | null
}

// Request payload for updating notification settings
/** O PUT é MERGE PARCIAL no backend: chave ausente significa "não mexer".
 *  Mandar só o que mudou é o contrato — montar um payload fixo com N chaves foi
 *  o que apagava as configurações que não estavam na lista. */
export interface UpdateNotificationSettingsPayload {
  checkout_immediate?: TemplateSettings | null
  item_added?: TemplateSettings | null
  checkout_reminder?: TemplateSettings | null
  out_of_window_scheduled?: TemplateSettings | null
  out_of_window_session_ended?: TemplateSettings | null
  out_of_window_event_ended?: TemplateSettings | null
  event_deadline_started?: TemplateSettings | null
  waitlist_unfulfilled?: TemplateSettings | null
  waitlist_joined?: TemplateSettings | null
  payment_confirmed?: EmailTemplateSettings | null
  shipped?: EmailTemplateSettings | null
  delivered?: EmailTemplateSettings | null
  payment_cancelled?: EmailTemplateSettings | null
  payment_refunded?: EmailTemplateSettings | null
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
  "out_of_window_scheduled",
  "out_of_window_session_ended",
  "out_of_window_event_ended",
  "event_deadline_started",
  "waitlist_joined",
  "waitlist_unfulfilled",
] as const
export type CartNotificationType = (typeof CART_NOTIFICATION_TYPES)[number]

// Post-payment notifications go through email. Subject + body_html shape.
export const POST_PAYMENT_NOTIFICATION_TYPES = [
  "payment_confirmed",
  "payment_cancelled",
  "payment_refunded",
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

// =============================================================================
// RN-38 — COMPRADORES NÃO AVISADOS
// =============================================================================

/** Motivo pelo qual a mensagem não pôde ser entregue. Espelha o vocabulário do
 *  backend; texto legível vem pronto em `reasonText`, para que a lista, o
 *  alerta e qualquer outra superfície digam a mesma coisa. */
export type UndeliverableReason =
  | "comment_too_old"
  | "private_reply_used"
  | "no_eligible_comment"
  | "comment_deleted"
  | "instagram_rejected"

/** Uma PESSOA que não pôde ser avisada — não uma tentativa. O backend colapsa
 *  por comprador porque o lojista precisa de "quem eu chamo na mão". */
export interface UndeliveredEntry {
  platformUserId: string
  platformHandle: string
  notificationType: string
  reason: UndeliverableReason | string
  /** Frase pronta para o painel, vinda do domínio. */
  reasonText: string
  cartId?: string
  cartToken?: string
  cartTotalCents: number
  cartTotalItems: number
  createdAt: string
}

export interface UndeliveredResponse {
  total: number
  entries: UndeliveredEntry[]
}
