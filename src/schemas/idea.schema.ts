import { z } from "zod"

export const createIdeaSchema = z.object({
  title: z
    .string()
    .min(8, "Título precisa ter ao menos 8 caracteres")
    .max(140, "Título precisa ter no máximo 140 caracteres"),
  description: z
    .string()
    .min(20, "Descrição precisa ter ao menos 20 caracteres")
    .max(5000, "Descrição precisa ter no máximo 5000 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
})

export type CreateIdeaFormData = z.infer<typeof createIdeaSchema>

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Escreva algo no comentário")
    .max(5000, "Comentário precisa ter no máximo 5000 caracteres"),
  parentCommentId: z.string().uuid().optional(),
})

export type CreateCommentFormData = z.infer<typeof createCommentSchema>
