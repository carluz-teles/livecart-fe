"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useCallback } from "react"
import {
  checkoutFormSchema,
  type CheckoutFormData,
  isCustomerInfoComplete,
  isShippingAddressComplete,
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
      customerName: "",
      customerDocument: "",
      customerPhone: "",
      shippingAddress: {
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

  useEffect(() => {
    if (defaultEmail && !form.getValues("email")) {
      form.setValue("email", defaultEmail)
    }
  }, [defaultEmail, form])

  const email = form.watch("email")
  const customerName = form.watch("customerName")
  const customerDocument = form.watch("customerDocument")
  const customerPhone = form.watch("customerPhone")
  const shippingAddress = form.watch("shippingAddress")

  const customerInfoComplete = isCustomerInfoComplete({
    email,
    customerName,
    customerDocument,
    customerPhone,
  })
  const addressComplete = isShippingAddressComplete(shippingAddress)
  const canProceedToPayment = customerInfoComplete && addressComplete

  const formatCep = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
    }
    return cleaned
  }, [])

  const handleCepChange = useCallback(
    async (value: string) => {
      const formatted = formatCep(value)
      form.setValue("shippingAddress.zipCode", formatted, { shouldValidate: true })

      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length === 8) {
        try {
          const addressData = await cepLookup.mutateAsync(cleaned)
          form.setValue("shippingAddress.street", addressData.street, { shouldValidate: true })
          form.setValue("shippingAddress.neighborhood", addressData.neighborhood, { shouldValidate: true })
          form.setValue("shippingAddress.city", addressData.city, { shouldValidate: true })
          form.setValue("shippingAddress.state", addressData.state, { shouldValidate: true })
        } catch {
          // Error is handled by useCepLookup mutation state
        }
      }
    },
    [form, formatCep, cepLookup]
  )

  const isAddressAutoFilled = cepLookup.isSuccess

  return {
    form,
    customerInfoComplete,
    addressComplete,
    canProceedToPayment,
    handleCepChange,
    isAddressAutoFilled,
    cepLookupLoading: cepLookup.isPending,
    cepLookupError: cepLookup.error?.message ?? null,
  }
}
