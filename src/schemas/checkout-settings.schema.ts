import { z } from "zod"

// Template settings schema (still used by the Communications editor)
export const templateSettingsSchema = z.object({
  enabled: z.boolean(),
  template: z.string().min(1, "Template não pode estar vazio").max(1500),
})
export type TemplateSettingsData = z.infer<typeof templateSettingsSchema>

// Checkout settings now only covers cart-only fields. Per-notification
// templates and triggers (realTimeCart, sendExpirationReminder, reminder
// minutes) live in the Communications editor.
export const checkoutSettingsSchema = z.object({
  enabled: z.boolean(),
  allowEdit: z.boolean(),
  expirationMinutes: z
    .number()
    .min(5, "Mínimo de 5 minutos")
    .max(1440, "Máximo de 24 horas"),
  reserveStock: z.boolean(),
  allowStorePickup: z.boolean(),
  maxQuantityPerItem: z.number().min(1, "Mínimo de 1 item"),
})

export type CheckoutSettingsFormData = z.infer<typeof checkoutSettingsSchema>

// Default IG DM templates kept here because the Communications editor reads
// them as fallback values when a store has no template configured yet.
// Post-payment (email) types intentionally have empty defaults — the BE owns
// the polished default content; the merchant only sees their own override.
export const defaultTemplates = {
  checkout_immediate:
    "Oi {handle}! 🛒\n\nAnotei seu pedido de {produto}!\n\nTotal: {total}\n\nFinalize aqui: {link}\n\n⏰ Válido por {expira_em}",
  item_added:
    "Oi {handle}! ➕\n\nAdicionei {produto} ao seu carrinho!\n\nAgora são {total_itens} itens - {total}\n\nFinalize: {link}",
  checkout_reminder:
    "Ei {handle}! ⏰\n\nSeu carrinho vai expirar em breve!\n\n{total_itens} itens - {total}\n\nFinaliza logo: {link}",
  payment_confirmed: "",
  shipped: "",
  delivered: "",
} as const

// Friendly names for template variables — read by the Communications editor.
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
