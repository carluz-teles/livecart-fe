import { z } from "zod"

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  price: z
    .number({ message: "Preço deve ser um número" })
    .min(1, "Preço deve ser maior que zero"),
  stock: z
    .number({ message: "Estoque deve ser um número" })
    .min(0, "Estoque não pode ser negativo"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  externalSource: z.enum(["manual", "bling", "tiny", "shopify"], {
    message: "Selecione a origem do produto",
  }),
  externalId: z.string().optional(),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.extend({
  active: z.boolean().default(true),
})

export type UpdateProductFormData = z.infer<typeof updateProductSchema>
