import { z } from "zod"

// Form is intentionally string-typed for the money/percent inputs — we convert
// to cents / basis points in the submit handler. Native number inputs lose
// the "" empty state and force users into 0 the moment they tab through, which
// makes "valor mínimo de compra" feel mandatory.
export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Código deve ter pelo menos 2 caracteres")
      .max(40, "Código deve ter no máximo 40 caracteres"),
    type: z.enum(["percent", "fixed", "free_shipping"]),
    percentValue: z.string().optional(), // 1–100
    fixedValueBrl: z.string().optional(), // 0.01+
    // Optional ceiling on a free-shipping discount, in BRL. When set, the
    // checkout never refunds more than this amount even when the cheapest
    // available shipping costs more — protects the merchant from absorbing
    // remote-CEP freight that blew past their margin.
    freeShippingMaxBrl: z.string().optional(),
    maxUses: z.string().optional(),
    minPurchaseBrl: z.string().optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "percent") {
      const n = Number(data.percentValue)
      if (!data.percentValue || Number.isNaN(n) || n < 1 || n > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["percentValue"],
          message: "Informe um valor entre 1 e 100",
        })
      }
    }
    if (data.type === "fixed") {
      const n = Number(data.fixedValueBrl)
      if (!data.fixedValueBrl || Number.isNaN(n) || n <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["fixedValueBrl"],
          message: "Informe um valor maior que zero",
        })
      }
    }
    if (data.type === "free_shipping" && data.freeShippingMaxBrl) {
      const n = Number(data.freeShippingMaxBrl)
      if (Number.isNaN(n) || n <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["freeShippingMaxBrl"],
          message: "Informe um valor maior que zero ou deixe em branco",
        })
      }
    }
    if (data.maxUses) {
      const n = Number(data.maxUses)
      if (Number.isNaN(n) || n < 1 || !Number.isInteger(n)) {
        ctx.addIssue({
          code: "custom",
          path: ["maxUses"],
          message: "Informe um número inteiro maior que zero",
        })
      }
    }
    if (data.validFrom && data.validUntil && data.validUntil <= data.validFrom) {
      ctx.addIssue({
        code: "custom",
        path: ["validUntil"],
        message: "Data final deve ser depois da inicial",
      })
    }
  })

export type CouponFormData = z.infer<typeof couponFormSchema>
