import { z } from "zod"

// =============================================================================
// EVENT (CAMPANHA)
// =============================================================================
//
// Os schemas `eventTypeSchema` / `eventDetailsSchema` /
// `platformConnectionSchema` saíram daqui. Eram os passos de um wizard que não
// existe mais e o primeiro deles perguntava `single | multi` — o vocabulário
// que a 000122 apagou do banco e que nenhuma tela lê. Manter um schema morto
// que ensina o modelo antigo é como o modelo antigo volta.

// Criação da campanha. `type` aqui é o tipo da PRIMEIRA SESSÃO.
export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Titulo e obrigatorio")
      .max(200, "Titulo deve ter no maximo 200 caracteres"),
    // Espécie da primeira transmissão (live/post/reel/story) — o backend
    // repassa direto para `live_sessions.type`. A campanha em si não tem tipo.
    type: z.enum(["live", "post", "reel", "story"]).optional(),
    platform: z.literal("instagram").optional(), // Only Instagram supported
    platformLiveId: z.string().max(100).optional(),
    // Janela comercial da campanha.
    startsAt: z.string().nullable().optional(),
    // OBRIGATÓRIO (RN-05). O backend marca EndsAt como `validate:"required"` e
    // responde 422 sem ele — a criação de evento estava quebrada exatamente
    // por isso, e sem mensagem de campo o lojista não tinha como descobrir.
    endsAt: z.string().min(1, "Informe quando a campanha fecha"),
    description: z.string().max(1000).nullable().optional(),
    // Cart settings (override store defaults)
    closeCartOnEventEnd: z.boolean().optional(),
    // Piso 15: espelha o CHECK live_events_cart_expiration_minutes_check
    // (migration 000104). Abaixo disso o banco rejeita, então validar aqui
    // devolve erro de campo em vez de 500. null = herda a config da loja.
    // Piso 15 espelha o CHECK do banco. NÃO há teto: o limite de 1440 vinha da
    // lista fixa do select, não de nenhuma regra — uma campanha de vários dias
    // pode querer um prazo maior que 24h.
    cartExpirationMinutes: z.number().int().min(15).nullable().optional(),
    // cart_max_quantity_per_item não tem CHECK no banco: aceita qualquer inteiro
    // positivo. O teto de 100 era invenção da tela.
    cartMaxQuantityPerItem: z.number().int().min(1).nullable().optional(),
    // RN-10 — espelha o CHECK 5..240 da migration 000073.
    waitlistNotifiedTtlMinutes: z.number().int().min(5).max(240).nullable().optional(),
    freeShipping: z.boolean().optional(),
    // Pix discount in whole percent (0-100). 0 disables the feature.
    pixDiscountPercent: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (v) => !v.startsAt || new Date(v.endsAt) > new Date(v.startsAt),
    { path: ["endsAt"], message: "O fim precisa ser depois do início" }
  )

export type CreateEventFormData = z.infer<typeof createEventSchema>

/** Edição da janela comercial de um evento já criado (RN-05/CA-05.7). */
export const updateEventWindowSchema = z
  .object({
    title: z
      .string()
      .min(1, "Titulo e obrigatorio")
      .max(200, "Titulo deve ter no maximo 200 caracteres"),
    startsAt: z.string().nullable().optional(),
    // O backend recusa remover o teto: sem ends_at o carrinho perde o prazo.
    endsAt: z.string().min(1, "Informe quando a campanha fecha"),
    waitlistNotifiedTtlMinutes: z.number().int().min(5).max(240).optional(),
    pixDiscountPercent: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (v) => !v.startsAt || new Date(v.endsAt) > new Date(v.startsAt),
    { path: ["endsAt"], message: "O fim precisa ser depois do início" }
  )

export type UpdateEventWindowFormData = z.infer<typeof updateEventWindowSchema>

// =============================================================================
// OTHER SCHEMAS
// =============================================================================

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, "Titulo e obrigatorio")
    .max(200, "Titulo deve ter no maximo 200 caracteres"),
})

export type UpdateEventFormData = z.infer<typeof updateEventSchema>

export const createSessionSchema = z.object({
  platform: z.literal("instagram").optional(), // Only Instagram supported
  // Espécie da transmissão. Sem este campo toda sessão criada pelo painel
  // nascia `live`, inclusive as de post — e a lista de produtos da sessão, o
  // modo live e a métrica por sessão passam a rotular errado a partir daí.
  type: z.enum(["live", "post", "reel", "story"]).optional(),
  // A mídia é OPCIONAL. Era obrigatória, e isso fechava justamente o caso que
  // define o evento guarda-chuva: marcar a campanha antes de a transmissão
  // existir. Sem mídia a sessão nasce sem capturar nada — e a tabela avisa
  // isso com o badge "Sem publicação vinculada".
  platformLiveId: z
    .string()
    .max(100, "ID da publicação deve ter no maximo 100 caracteres")
    .optional(),
  mediaPermalink: z.string().optional(),
  mediaThumbnailUrl: z.string().optional(),
  mediaCaption: z.string().optional(),
  // Produtos que ESTA transmissão vende. Vazia = vende qualquer produto ativo
  // da loja, que é como toda sessão nascia. Entra na criação porque o backend
  // grava sessão e lista na mesma transação — encadear no cliente deixaria a
  // transmissão no ar com lista pela metade se a segunda chamada falhasse.
  productIds: z.array(z.string().uuid()).optional(),
})

export type CreateSessionFormData = z.infer<typeof createSessionSchema>

export const addPlatformSchema = z.object({
  platform: z.literal("instagram").optional(), // Only Instagram supported
  platformLiveId: z
    .string()
    .min(1, "ID da live e obrigatorio")
    .max(100, "ID da live deve ter no maximo 100 caracteres"),
})

export type AddPlatformFormData = z.infer<typeof addPlatformSchema>
