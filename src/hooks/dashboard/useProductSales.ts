"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { ProductSalesResponse } from "@/types"
import { dashboardKeys } from "./useDashboardStats"

export function useProductSales() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: dashboardKeys.productSales(storeId ?? ""),
    queryFn: async (): Promise<ProductSalesResponse> => {
      const token = await getToken()
      return dashboardService.getProductSales(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
