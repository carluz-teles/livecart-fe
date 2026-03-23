"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import type { CustomerStats } from "@/types"
import { customerKeys } from "./useCustomers"

export function useCustomerStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: customerKeys.stats(storeId ?? ""),
    queryFn: async (): Promise<CustomerStats> => {
      const token = await getToken()
      return customerService.getStats(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
