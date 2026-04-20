"use client"

import { useQuery } from "@tanstack/react-query"
import { checkoutService } from "@/services/api/checkout.service"
import { checkoutKeys } from "./useCheckoutCart"
import type { PaymentStatusResponse } from "@/types"

export function usePaymentStatus(
  token: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number | false
  }
) {
  const { enabled = true, refetchInterval = false } = options ?? {}

  return useQuery({
    queryKey: checkoutKeys.status(token),
    queryFn: (): Promise<PaymentStatusResponse> => checkoutService.getPaymentStatus(token),
    enabled: !!token && enabled,
    refetchInterval,
    staleTime: 0, // Always refetch status
  })
}
