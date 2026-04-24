"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { shippingService } from "@/services/api/shipping.service"
import { useStoreId } from "@/hooks/useUser"
import type { IntegrationProvider } from "@/types"

export const shippingKeys = {
  all: ["shipping"] as const,
  carriers: (storeId: string, provider: IntegrationProvider) =>
    [...shippingKeys.all, "carriers", storeId, provider] as const,
}

export function useShippingCarriers(
  provider: IntegrationProvider,
  options?: { enabled?: boolean }
) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useQuery({
    queryKey: shippingKeys.carriers(storeId ?? "", provider),
    queryFn: async () => {
      const token = await getToken()
      return shippingService.listCarriers(storeId!, provider, token)
    },
    enabled: !!storeId && (options?.enabled ?? true),
  })
}
