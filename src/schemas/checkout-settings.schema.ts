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
  // Piso 15: espelha `validation.Min(15)` do backend e o CHECK da migration
  // 000104. Com 5 aqui, um valor entre 5 e 14 passava na validação do
  // formulário e voltava como 422 sem mensagem de campo coerente.
  expirationMinutes: z
    .number()
    .min(15, "Mínimo de 15 minutos")
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
export const defaultTemplates: Record<string, string> = {
  checkout_immediate:
    "Oi {handle}! 🛒\n\nAnotei seu pedido de {produto}!\n\nTotal: {total}\n\nFinalize aqui: {link}\n\n⏰ Válido por {expira_em}",
  item_added:
    "Oi {handle}! ➕\n\nAdicionei {produto} ao seu carrinho!\n\nAgora são {total_itens} itens - {total}\n\nFinalize: {link}",
  checkout_reminder:
    "Ei {handle}! ⏰\n\nSeu carrinho vai expirar em breve!\n\n{total_itens} itens - {total}\n\nFinaliza logo: {link}",
  // Os gatilhos da RN-28 não têm fallback aqui de propósito: o backend
  // preenche o texto padrão de toda chave na leitura, e um segundo texto
  // padrão no frontend seria uma cópia que envelhece sozinha — foi assim que
  // o de `checkout_immediate` acabou prometendo "válido por {expira_em}"
  // depois que o carrinho parou de expirar durante a campanha.
  out_of_window_scheduled: "",
  out_of_window_session_ended: "",
  out_of_window_event_ended: "",
  event_deadline_started: "",
  waitlist_notified: "",
  waitlist_unfulfilled: "",
  payment_confirmed: "",
  shipped: "",
  delivered: "",
}

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
