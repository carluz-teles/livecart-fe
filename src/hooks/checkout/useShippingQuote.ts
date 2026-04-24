"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { checkoutService } from "@/services/api/checkout.service"
import { checkoutKeys } from "./useCheckoutCart"
import type {
  ShippingQuoteResponse,
  SelectShippingMethodResponse,
} from "@/types"

interface QuoteShippingArgs {
  token: string
  zipCode: string // digits only; backend normalizes
}

export function useShippingQuote() {
  return useMutation<ShippingQuoteResponse, Error, QuoteShippingArgs>({
    mutationFn: ({ token, zipCode }) =>
      checkoutService.quoteShipping(token, { zipCode }),
  })
}

interface SelectShippingArgs {
  token: string
  serviceId: string
  zipCode: string
  provider?: string
}

export function useSelectShippingMethod() {
  const queryClient = useQueryClient()
  return useMutation<SelectShippingMethodResponse, Error, SelectShippingArgs>({
    mutationFn: ({ token, serviceId, zipCode, provider }) =>
      checkoutService.selectShippingMethod(token, {
        serviceId,
        zipCode,
        ...(provider ? { provider } : {}),
      }),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.cart(token) })
    },
  })
}
