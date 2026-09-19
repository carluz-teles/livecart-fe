"use client"

import { useState } from "react"
import type { ImportERPProductResponse } from "@/types/integration.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "@/hooks/product/useProducts"
import { productGroupKeys } from "@/hooks/product-group/useProductGroups"

interface ImportArgs {
  integrationId: string
  tinyProductId: string
  // Omitted / empty = import every variant (backend behavior).
  variantIds?: string[]
}

export function useImportERPProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const mutation = useMutation({
    mutationFn: async ({ integrationId, tinyProductId, variantIds }: ImportArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const ids = [...new Set(variantIds ?? [])]
      const batches = ids.length ? Array.from({ length: Math.ceil(ids.length / 5) }, (_, i) => ids.slice(i * 5, i * 5 + 5)) : [undefined]
      setProgress({ completed: 0, total: ids.length })
      let result: ImportERPProductResponse | undefined
      for (const batch of batches) {
        const token = await getToken()
        const next = await integrationService.importProduct(storeId, integrationId, tinyProductId, batch, token)
        result = result ? { ...next, imported: [...result.imported, ...next.imported] } : next
        setProgress(previous => ({ ...previous, completed: previous.completed + (batch?.length ?? 1) }))
      }
      return result!

    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", "erp-products"] })
      queryClient.invalidateQueries({ queryKey: ["integrations", "erp-product-details"] })
      // The import can persist a group + N products in one call; refresh both
      // catalog lists and stats so the new entries show up immediately.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productGroupKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
  return { ...mutation, progress }
}
