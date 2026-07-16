import { z } from "zod"

const CEP_REGEX = /^\d{5}-?\d{3}$/
const UF_REGEX = /^[A-Z]{2}$/

// Validates Brazilian CPF (11 digits + 2 check digits)
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "")

  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  const calcCheckDigit = (slice: string, factorStart: number) => {
    let sum = 0
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (factorStart - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const digit1 = calcCheckDigit(digits.slice(0, 9), 10)
  if (digit1 !== parseInt(digits[9], 10)) return false

  const digit2 = calcCheckDigit(digits.slice(0, 10), 11)
  return digit2 === parseInt(digits[10], 10)
}

export const shippingAddressSchema = z.object({
  zipCode: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(CEP_REGEX, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .length(2, "UF deve ter 2 letras")
    .regex(UF_REGEX, "UF inválida"),
})

export const checkoutFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  customerName: z
    .string()
    .min(1, "Nome é obrigatório")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      { message: "Informe nome e sobrenome" }
    ),
  customerDocument: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine(isValidCPF, { message: "CPF inválido" }),
  // Obrigatório: contas PSP do Pagar.me exigem telefone no customer (412
  // "At least one customer phone is required") e a recuperação de carrinho
  // via WhatsApp depende dele.
  customerPhone: z
    .string()
    .min(1, "Celular é obrigatório")
    .refine(
      (val) => {
        const cleaned = val.replace(/\D/g, "")
        return cleaned.length >= 10 && cleaned.length <= 11
      },
      { message: "Telefone inválido" }
    ),
  shippingAddress: shippingAddressSchema,
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>

type CustomerFields = Pick<
  CheckoutFormData,
  "email" | "customerName" | "customerDocument" | "customerPhone"
>

export function isCustomerInfoComplete(data: Partial<CustomerFields>): boolean {
  const emailResult = checkoutFormSchema.shape.email.safeParse(data.email)
  const nameResult = checkoutFormSchema.shape.customerName.safeParse(data.customerName)
  const documentResult = checkoutFormSchema.shape.customerDocument.safeParse(data.customerDocument)
  const phoneResult = checkoutFormSchema.shape.customerPhone.safeParse(data.customerPhone)
  return (
    emailResult.success &&
    nameResult.success &&
    documentResult.success &&
    phoneResult.success
  )
}

export function isShippingAddressComplete(data: Partial<ShippingAddressFormData>): boolean {
  return shippingAddressSchema.safeParse(data).success
}
