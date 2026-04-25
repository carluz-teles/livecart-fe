"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productGroupService } from "@/services/api/productGroup.service"
import { useStoreId } from "@/hooks/useUser"
import type { ProductGroupListParams } from "@/types"

export const productGroupKeys = {
  all: ["product-groups"] as const,
  lists: () => [...productGroupKeys.all, "list"] as const,
  list: (storeId: string, params?: ProductGroupListParams) =>
    [...productGroupKeys.lists(), storeId, params] as const,
  details: () => [...productGroupKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) =>
    [...productGroupKeys.details(), storeId, id] as const,
}

export function useProductGroups(params?: ProductGroupListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productGroupKeys.list(storeId ?? "", params),
    queryFn: async () => {
      const token = await getToken()
      return productGroupService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
