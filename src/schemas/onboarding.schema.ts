import { z } from "zod"

// Address schema
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
})

export type AddressData = z.infer<typeof addressSchema>

// Step 1: Store info
export const storeStepSchema = z.object({
  storeName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  whatsappNumber: z.string().optional(),
  emailAddress: z.string().email("Email inválido").optional().or(z.literal("")),
  address: addressSchema.optional(),
})

export type StoreStepData = z.infer<typeof storeStepSchema>

// Step 2: Cart settings
export const cartStepSchema = z.object({
  enabled: z.boolean(),
  expirationMinutes: z.number().min(0, "Deve ser 0 ou maior"),
  reserveStock: z.boolean(),
  maxItems: z.number().min(0, "Deve ser 0 ou maior"),
  maxQuantityPerItem: z.number().min(0, "Deve ser 0 ou maior"),
})

export type CartStepData = z.infer<typeof cartStepSchema>

// Step 3: Integrations - no schema needed, just selection

// Step 4: Team invitations
export const teamInviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "member"]),
})

export type TeamInviteData = z.infer<typeof teamInviteSchema>

// Legacy - keep for backwards compatibility
export const onboardingSchema = storeStepSchema
export type OnboardingFormData = StoreStepData
