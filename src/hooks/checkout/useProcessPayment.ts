"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { checkoutService } from "@/services/api/checkout.service"
import { checkoutKeys } from "./useCheckoutCart"
import type {
  ProcessCardPaymentRequest,
  ProcessCardPaymentResponse,
  GeneratePixRequest,
  GeneratePixResponse,
} from "@/types"

export function useProcessCardPayment(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProcessCardPaymentRequest): Promise<ProcessCardPaymentResponse> =>
      checkoutService.processCardPayment(token, data),
    onSuccess: () => {
      // Invalidate cart and status queries on successful payment
      queryClient.invalidateQueries({ queryKey: checkoutKeys.cart(token) })
      queryClient.invalidateQueries({ queryKey: checkoutKeys.status(token) })
    },
  })
}

export function useGeneratePix(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GeneratePixRequest): Promise<GeneratePixResponse> =>
      checkoutService.generatePix(token, data),
    onSuccess: () => {
      // Invalidate status query when PIX is generated
      queryClient.invalidateQueries({ queryKey: checkoutKeys.status(token) })
    },
  })
}
