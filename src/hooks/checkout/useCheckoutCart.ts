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

export function useCheckoutCart(
  token: string,
  initialData?: PublicCheckoutCart
) {
  return useQuery({
    queryKey: checkoutKeys.cart(token),
    queryFn: (): Promise<PublicCheckoutCart> => checkoutService.getCart(token),
    enabled: !!token,
    initialData,
    staleTime: 30 * 1000, // 30 seconds
    // Expiration is detected client-side by CheckoutExpirationTimer's
    // 1s interval reading Date.now() — refetching on focus would churn
    // the cart object and remount the Mercado Pago Secure Fields iframes.
    refetchOnWindowFocus: false,
  })
}
