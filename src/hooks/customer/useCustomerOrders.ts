"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import type { CustomerOrder } from "@/types"
import { customerKeys } from "./useCustomers"

export function useCustomerOrders(id: string | null, enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: [...customerKeys.detail(storeId ?? "", id ?? ""), "orders"],
    queryFn: async (): Promise<CustomerOrder[]> => {
      const token = await getToken()
      return customerService.listOrders(storeId!, id!, token)
    },
    enabled:
      enabled && isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
