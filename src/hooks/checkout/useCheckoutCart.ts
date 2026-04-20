"use client"

import { useQuery } from "@tanstack/react-query"
import { checkoutService } from "@/services/api/checkout.service"
import type { PublicCheckoutCart } from "@/types"

export const checkoutKeys = {
  all: ["checkout"] as const,
  cart: (token: string) => [...checkoutKeys.all, "cart", token] as const,
  config: (token: string) => [...checkoutKeys.all, "config", token] as const,
  status: (token: string) => [...checkoutKeys.all, "status", token] as const,
}

export function useCheckoutCart(token: string) {
  return useQuery({
    queryKey: checkoutKeys.cart(token),
    queryFn: (): Promise<PublicCheckoutCart> => checkoutService.getCart(token),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })
}
