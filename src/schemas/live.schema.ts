import { z } from "zod"

export const createLiveSchema = z.object({
  platform: z.enum(["instagram", "facebook", "youtube", "tiktok"], {
    message: "Selecione a plataforma",
  }),
  platformLiveId: z
    .string()
    .min(1, "ID da live é obrigatório")
    .max(100, "ID da live deve ter no máximo 100 caracteres"),
})

export type CreateLiveFormData = z.infer<typeof createLiveSchema>
