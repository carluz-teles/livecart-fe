import { z } from "zod"

const positiveInt = z
  .number({ message: "Informe um número inteiro positivo" })
  .int("Use um número inteiro")
  .positive("Deve ser maior que zero")

export const shippingProfileSchema = z
  .object({
    weightGrams: positiveInt.nullable(),
    heightCm: positiveInt.nullable(),
    widthCm: positiveInt.nullable(),
    lengthCm: positiveInt.nullable(),
    sku: z.string().max(100, "SKU deve ter no máximo 100 caracteres"),
    packageFormat: z.enum(["box", "roll", "letter"]),
    insuranceValueCents: z
      .number({ message: "Valor inválido" })
      .int()
      .nonnegative()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    const dims = [data.weightGrams, data.heightCm, data.widthCm, data.lengthCm]
    const filled = dims.filter((v) => v !== null && v !== undefined).length
    if (filled !== 0 && filled !== 4) {
      const message =
        "Para cotar frete, preencha peso e as três dimensões, ou deixe tudo em branco."
      const fields: Array<keyof typeof data> = [
        "weightGrams",
        "heightCm",
        "widthCm",
        "lengthCm",
      ]
      for (const field of fields) {
        if (data[field] === null || data[field] === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message,
          })
        }
      }
    }
  })

export type ShippingProfileFormData = z.infer<typeof shippingProfileSchema>

export const defaultShippingProfile: ShippingProfileFormData = {
  weightGrams: null,
  heightCm: null,
  widthCm: null,
  lengthCm: null,
  sku: "",
  packageFormat: "box",
  insuranceValueCents: null,
}

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
  shipping: shippingProfileSchema,
})

export type CreateProductFormData = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.extend({
  active: z.boolean(),
})

export type UpdateProductFormData = z.infer<typeof updateProductSchema>
