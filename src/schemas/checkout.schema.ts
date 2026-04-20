import { z } from "zod"

// Regex patterns
const CEP_REGEX = /^\d{5}-?\d{3}$/

// Address schema
export const addressSchema = z.object({
  zipCode: z
    .string()
    .min(8, "CEP é obrigatório")
    .regex(CEP_REGEX, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .length(2, "Estado deve ter 2 letras")
    .toUpperCase(),
})

// Checkout form schema
export const checkoutFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  phone: z
    .string()
    .min(10, "Telefone é obrigatório")
    .refine(
      (val) => {
        const cleaned = val.replace(/\D/g, "")
        return cleaned.length >= 10 && cleaned.length <= 11
      },
      { message: "Telefone inválido" }
    ),
  address: addressSchema,
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type AddressFormData = z.infer<typeof addressSchema>

// Helper to check if contact info is complete
export function isContactInfoComplete(data: Partial<CheckoutFormData>): boolean {
  const emailResult = checkoutFormSchema.shape.email.safeParse(data.email)
  const phoneResult = checkoutFormSchema.shape.phone.safeParse(data.phone)
  return emailResult.success && phoneResult.success
}

// Helper to check if address is complete
export function isAddressComplete(data: Partial<AddressFormData>): boolean {
  const result = addressSchema.safeParse(data)
  return result.success
}
