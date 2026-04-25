"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productGroupService } from "@/services/api/productGroup.service"
import { useStoreId } from "@/hooks/useUser"
import { productGroupKeys } from "./useProductGroups"

export function useProductGroup(id: string | null | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productGroupKeys.detail(storeId ?? "", id ?? ""),
    queryFn: async () => {
      const token = await getToken()
      return productGroupService.getById(storeId!, id!, token)
    },
    enabled:
      isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
