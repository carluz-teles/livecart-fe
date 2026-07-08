import { z } from "zod"

// CNPJ validation helper
function isValidCNPJ(cnpj: string): boolean {
  // Remove formatting
  const cleaned = cnpj.replace(/[^\d]/g, "")

  // Must have 14 digits
  if (cleaned.length !== 14) return false

  // Check for known invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(cleaned)) return false

  // Validate check digits
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let remainder = sum % 11
  if (parseInt(cleaned[12]) !== (remainder < 2 ? 0 : 11 - remainder)) return false

  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  remainder = sum % 11
  if (parseInt(cleaned[13]) !== (remainder < 2 ? 0 : 11 - remainder)) return false

  return true
}

// Address schema - city and state required for Brazilian addresses
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  zip: z.string().optional(),
  country: z.string().optional(),
})

export type AddressData = z.infer<typeof addressSchema>

// Step 1: Store info (simplified wizard)
export const storeStepSchema = z.object({
  storeName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cnpj: z
    .string()
    .optional()
    .refine((val) => !val || isValidCNPJ(val), {
      message: "CNPJ inválido",
    }),
  whatsappNumber: z.string().optional(),
  emailAddress: z.string().email("Email inválido").optional().or(z.literal("")),
  address: addressSchema,
})

export type StoreStepData = z.infer<typeof storeStepSchema>

// Step 2: Cart settings
export const cartStepSchema = z.object({
  enabled: z.boolean(),
  expirationMinutes: z.number().min(0, "Deve ser 0 ou maior"),
  reserveStock: z.boolean(),
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

// ============================================
// Wizard 2.0 (4 passos: Você → Loja → Endereço → Contato)
// ============================================

export const wizardUserSchema = z.object({
  firstName: z.string().min(2, "Como você se chama?").max(50),
  lastName: z.string().min(1, "Sobrenome obrigatório").max(50),
})
export type WizardUserData = z.infer<typeof wizardUserSchema>

export const wizardStoreSchema = z.object({
  storeName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cnpj: z
    .string()
    .optional()
    .refine((val) => !val || isValidCNPJ(val), { message: "CNPJ inválido" }),
})
export type WizardStoreData = z.infer<typeof wizardStoreSchema>

export const wizardAddressSchema = z.object({
  zip: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Selecione a UF"),
})
export type WizardAddressData = z.infer<typeof wizardAddressSchema>

export const wizardContactSchema = z.object({
  whatsappNumber: z.string().optional(),
  emailAddress: z.string().email("Email inválido").optional().or(z.literal("")),
})
export type WizardContactData = z.infer<typeof wizardContactSchema>
