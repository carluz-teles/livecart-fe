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

// =============================================================================
// PRODUCT GROUPS (variants)
// =============================================================================

const optionSchema = z.object({
  name: z
    .string()
    .min(1, "Nome da opção é obrigatório")
    .max(50, "Nome muito longo"),
  values: z
    .array(
      z
        .string()
        .min(1, "Valor não pode estar vazio")
        .max(50, "Valor muito longo")
    )
    .min(1, "Adicione ao menos um valor para essa opção"),
})

const groupVariantSchema = z.object({
  optionValues: z.array(z.string().min(1)),
  price: z
    .number({ message: "Preço deve ser um número" })
    .min(1, "Preço deve ser maior que zero"),
  stock: z
    .number({ message: "Estoque deve ser um número" })
    .min(0, "Estoque não pode ser negativo"),
  sku: z
    .string()
    .max(100, "SKU deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

export const createProductGroupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres"),
    description: z
      .string()
      .max(2000, "Descrição muito longa")
      .optional()
      .or(z.literal("")),
    options: z
      .array(optionSchema)
      .min(1, "Adicione ao menos uma opção (ex.: Cor, Tamanho)")
      .max(3, "No máximo três opções por grupo"),
    groupImages: z
      .array(z.string().url("URL inválida"))
      .optional(),
    variants: z
      .array(groupVariantSchema)
      .min(1, "Pelo menos uma variante é necessária"),
    // A single shipping profile applied to every variant on submit. Same
    // all-or-nothing rule as simple products.
    shipping: shippingProfileSchema,
  })
  .superRefine((data, ctx) => {
    // Each variant's optionValues must match the options[] order/length.
    const expectedLen = data.options.length
    data.variants.forEach((v, i) => {
      if (v.optionValues.length !== expectedLen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants", i, "optionValues"],
          message: `A variante deve ter ${expectedLen} valor(es) — um por opção`,
        })
        return
      }
      v.optionValues.forEach((value, optIdx) => {
        const declared = data.options[optIdx]?.values ?? []
        if (!declared.includes(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", i, "optionValues", optIdx],
            message: `Valor "${value}" não está declarado em "${data.options[optIdx]?.name}"`,
          })
        }
      })
    })

    // Option names must be unique within the group.
    const seenNames = new Set<string>()
    data.options.forEach((opt, i) => {
      const key = opt.name.trim().toLowerCase()
      if (seenNames.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options", i, "name"],
          message: "Já existe outra opção com esse nome",
        })
      }
      seenNames.add(key)
    })

    // Variant combinations must be unique.
    const seenCombos = new Set<string>()
    data.variants.forEach((v, i) => {
      const key = v.optionValues.join("⟂")
      if (seenCombos.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants", i, "optionValues"],
          message: "Combinação duplicada entre variantes",
        })
      }
      seenCombos.add(key)
    })
  })

export type CreateProductGroupFormData = z.infer<typeof createProductGroupSchema>

export const defaultProductGroupForm: CreateProductGroupFormData = {
  name: "",
  description: "",
  options: [{ name: "", values: [] }],
  groupImages: [],
  variants: [],
  shipping: defaultShippingProfile,
}
