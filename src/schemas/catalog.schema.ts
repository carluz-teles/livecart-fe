import { z } from "zod"

export const catalogSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(80, "Nome deve ter no máximo 80 caracteres"),
})

export type CatalogFormData = z.infer<typeof catalogSchema>
