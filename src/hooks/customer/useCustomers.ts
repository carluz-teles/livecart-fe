"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import type { CustomerListParams, CustomerListResponse } from "@/types"

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (storeId: string, params?: CustomerListParams) => [...customerKeys.lists(), storeId, params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...customerKeys.details(), storeId, id] as const,
  stats: (storeId: string) => [...customerKeys.all, "stats", storeId] as const,
  // The block list is keyed by store + includeInactive so toggling the
  // "incluir desbloqueados" filter doesn't reuse the active-only cache.
  blocked: (storeId: string, includeInactive: boolean) =>
    [...customerKeys.all, "blocked", storeId, includeInactive] as const,
}

export function useCustomers(params?: CustomerListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: customerKeys.list(storeId ?? "", params),
    queryFn: async (): Promise<CustomerListResponse> => {
      const token = await getToken()
      return customerService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
