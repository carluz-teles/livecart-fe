"use client"

import { useAuth } from "@clerk/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useStoreId } from "@/hooks/useUser"
import { productService } from "@/services/api/product.service"
import { productKeys } from "./useProducts"
import type { ImportRequest } from "@/types/product-import.types"

export function useProductImport() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()
  const preview = useMutation({
    mutationFn: async (request: ImportRequest) => {
      if (!storeId) throw new Error("Aguarde o carregamento da loja.")
      return productService.previewImport(storeId, request, await getToken())
    },
    retry: false,
  })
  const apply = useMutation({
    mutationFn: async (request: ImportRequest) => {
      if (!storeId) throw new Error("Aguarde o carregamento da loja.")
      return productService.applyImport(storeId, request, await getToken())
    },
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
  return { storeId, preview, apply }
}
