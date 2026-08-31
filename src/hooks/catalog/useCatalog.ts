"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { CatalogDetail } from "@/types/catalog.types"
import { catalogKeys } from "./useCatalogs"

export function useCatalog(id: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: catalogKeys.detail(storeId ?? "", id || ""),
    queryFn: async (): Promise<CatalogDetail> => {
      if (!id) throw new Error("Catalog ID is required")
      const token = await getToken()
      return catalogService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
