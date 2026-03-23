"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import type { Customer } from "@/types"
import { customerKeys } from "./useCustomers"

export function useCustomer(id: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: customerKeys.detail(storeId ?? "", id),
    queryFn: async (): Promise<Customer> => {
      const token = await getToken()
      return customerService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
