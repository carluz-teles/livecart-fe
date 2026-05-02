"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { CheckoutUpsellResponse } from "@/types"

export function useEventCheckoutUpsell(eventId?: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: ["dashboard", "checkout-upsell", storeId ?? "", eventId ?? "all"],
    queryFn: async (): Promise<CheckoutUpsellResponse> => {
      const token = await getToken()
      return dashboardService.getCheckoutUpsell(storeId!, token, eventId)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
