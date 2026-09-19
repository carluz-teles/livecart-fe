"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { useStoreId } from "@/hooks/useUser"
import { integrationService } from "@/services/api/integration.service"
import type { ApiError, ERPProduct } from "@/types"

export function useERPProductDetails(integrationId: string, product: ERPProduct | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId } = useStoreId()
  return useQuery<ERPProduct, ApiError>({
    queryKey: ["integrations", "erp-product-details", storeId, integrationId, product?.id],
    queryFn: async ({ signal }) => {
      const token = await getToken()
      return integrationService.getProductDetails(storeId!, integrationId, product!.id, token, signal)
    },
    enabled: isLoaded && !!isSignedIn && !!storeId && !!integrationId && !!product?.detailsPending,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  })
}
