"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useCallback } from "react"
import {
  checkoutFormSchema,
  type CheckoutFormData,
  isContactInfoComplete,
  isAddressComplete,
} from "@/schemas/checkout.schema"
import { useCepLookup } from "./useCepLookup"

interface UseCheckoutFormOptions {
  defaultEmail?: string
}

export function useCheckoutForm(options?: UseCheckoutFormOptions) {
  const { defaultEmail } = options ?? {}

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      phone: "",
      address: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    },
    mode: "onChange",
  })

  const cepLookup = useCepLookup()

  // Update email if default changes (e.g., from cart data)
  useEffect(() => {
    if (defaultEmail && !form.getValues("email")) {
      form.setValue("email", defaultEmail)
    }
  }, [defaultEmail, form])

  // Watch values for completion checks
  const email = form.watch("email")
  const phone = form.watch("phone")
  const address = form.watch("address")

  // Derive completion states
  const contactInfoComplete = isContactInfoComplete({ email, phone })
  const addressComplete = isAddressComplete(address)
  const canProceedToPayment = contactInfoComplete && addressComplete

  // Format CEP as user types
  const formatCep = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
    }
    return cleaned
  }, [])

  // Handle CEP change with auto-lookup
  const handleCepChange = useCallback(
    async (value: string) => {
      const formatted = formatCep(value)
      form.setValue("address.zipCode", formatted, { shouldValidate: true })

      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length === 8) {
        try {
          const addressData = await cepLookup.mutateAsync(cleaned)
          form.setValue("address.street", addressData.street, { shouldValidate: true })
          form.setValue("address.neighborhood", addressData.neighborhood, { shouldValidate: true })
          form.setValue("address.city", addressData.city, { shouldValidate: true })
          form.setValue("address.state", addressData.state, { shouldValidate: true })
        } catch {
          // Error is handled by useCepLookup mutation state
        }
      }
    },
    [form, formatCep, cepLookup]
  )

  // Check if address fields were auto-filled from CEP
  const isAddressAutoFilled = cepLookup.isSuccess

  return {
    form,
    // Derived states
    contactInfoComplete,
    addressComplete,
    canProceedToPayment,
    // CEP lookup
    handleCepChange,
    isAddressAutoFilled,
    cepLookupLoading: cepLookup.isPending,
    cepLookupError: cepLookup.error?.message ?? null,
  }
}
