"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { useStoreId } from "@/hooks/useUser"
import { couponService } from "@/services/api/coupon.service"

export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (storeId: string, eventId: string) =>
    [...couponKeys.lists(), storeId, eventId] as const,
}

export function useCoupons(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: couponKeys.list(storeId ?? "", eventId),
    queryFn: async () => {
      const token = await getToken()
      return couponService.list(storeId!, eventId, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
