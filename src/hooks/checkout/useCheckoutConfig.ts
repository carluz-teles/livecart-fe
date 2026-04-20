"use client"

import { useQuery } from "@tanstack/react-query"
import { checkoutService } from "@/services/api/checkout.service"
import { checkoutKeys } from "./useCheckoutCart"
import type { CheckoutConfigResponse } from "@/types"

export function useCheckoutConfig(token: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.config(token),
    queryFn: (): Promise<CheckoutConfigResponse> => checkoutService.getConfig(token),
    enabled: !!token && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - config doesn't change often
  })
}
