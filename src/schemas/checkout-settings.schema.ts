import { z } from "zod"

// Template settings schema
export const templateSettingsSchema = z.object({
  enabled: z.boolean(),
  template: z.string().min(1, "Template não pode estar vazio").max(1500),
})

// Full checkout settings schema
export const checkoutSettingsSchema = z.object({
  // General
  enabled: z.boolean(),
  allowEdit: z.boolean(),

  // Expiration (unified - link uses same time as cart)
  expirationMinutes: z
    .number()
    .min(5, "Mínimo de 5 minutos")
    .max(1440, "Máximo de 24 horas"),

  // Limits
  reserveStock: z.boolean(),
  maxItems: z.number().min(0, "Deve ser 0 ou maior"),
  maxQuantityPerItem: z.number().min(1, "Mínimo de 1 item"),

  // Real-time cart mode (controls sendOnFirstItem + sendOnNewItems)
  realTimeCart: z.boolean(),

  // Expiration reminder
  sendExpirationReminder: z.boolean(),
  expirationReminderMinutes: z
    .number()
    .min(1, "Mínimo de 1 minuto")
    .max(60, "Máximo de 60 minutos"),

  // Templates
  templates: z.object({
    // Primeiro item adicionado (real-time)
    checkout_immediate: templateSettingsSchema.nullable(),
    // Novos itens adicionados (real-time)
    item_added: templateSettingsSchema.nullable(),
    // Lembrete de expiração
    checkout_reminder: templateSettingsSchema.nullable(),
  }),
})

export type CheckoutSettingsFormData = z.infer<typeof checkoutSettingsSchema>
export type TemplateSettingsData = z.infer<typeof templateSettingsSchema>

// Default templates with correct purposes
export const defaultTemplates = {
  // Primeiro item - enviada quando cliente adiciona primeiro item
  checkout_immediate:
    "Oi {handle}! 🛒\n\nAnotei seu pedido de {produto}!\n\nTotal: {total}\n\nFinalize aqui: {link}\n\n⏰ Válido por {expira_em}",
  // Novos itens - enviada quando cliente adiciona mais itens
  item_added:
    "Oi {handle}! ➕\n\nAdicionei {produto} ao seu carrinho!\n\nAgora são {total_itens} itens - {total}\n\nFinalize: {link}",
  // Lembrete de expiração - enviada X minutos antes de expirar
  checkout_reminder:
    "Ei {handle}! ⏰\n\nSeu carrinho vai expirar em breve!\n\n{total_itens} itens - {total}\n\nFinaliza logo: {link}",
}

// Friendly names for template variables
export const variableFriendlyNames: Record<string, string> = {
  "{handle}": "@ Perfil",
  "{produto}": "Produto",
  "{keyword}": "Palavra-chave",
  "{quantidade}": "Quantidade",
  "{total_itens}": "Nº de itens",
  "{total}": "Valor total",
  "{link}": "Link",
  "{loja}": "Nome da loja",
  "{expira_em}": "Tempo restante",
  "{live_titulo}": "Título da live",
}

// Convert technical variables to display format: {handle} -> {@ Perfil}
export function toDisplayFormat(template: string): string {
  let result = template
  for (const [technical, friendly] of Object.entries(variableFriendlyNames)) {
    result = result.replaceAll(technical, `{${friendly}}`)
  }
  return result
}

// Convert display format back to technical: {@ Perfil} -> {handle}
export function toTechnicalFormat(template: string): string {
  let result = template
  for (const [technical, friendly] of Object.entries(variableFriendlyNames)) {
    result = result.replaceAll(`{${friendly}}`, technical)
  }
  return result
}
