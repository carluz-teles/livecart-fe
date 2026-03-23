import { z } from "zod"

export const onboardingSchema = z.object({
  storeName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>
