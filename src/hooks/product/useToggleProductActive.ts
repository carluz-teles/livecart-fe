"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { Product } from "@/types/product.types"
import { productKeys } from "./useProducts"

/**
 * Hook for toggling product active status.
 * Provides optimistic updates and automatic error recovery.
 */
export function useToggleProductActive() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: Product): Promise<Product> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.update(
        storeId,
        product.id,
        {
          name: product.name,
          price: product.price,
          stock: product.stock,
          active: !product.active,
        },
        token
      )
    },
    onMutate: async (product) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(productKeys.lists())

      // Optimistically update the product in cache
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old: unknown) => {
        if (!old || typeof old !== "object") return old
        const data = old as { data: Product[] }
        if (!data.data) return old
        return {
          ...data,
          data: data.data.map((p: Product) =>
            p.id === product.id ? { ...p, active: !p.active } : p
          ),
        }
      })

      return { previousProducts }
    },
    onError: (_error, _product, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueriesData({ queryKey: productKeys.lists() }, context.previousProducts)
      }
      toast.error("Falha ao atualizar status do produto")
    },
    onSuccess: (data) => {
      const status = data.active ? "ativado" : "desativado"
      toast.success(`Produto ${status}`)

      // Update the detail cache if it exists
      if (storeId) {
        queryClient.setQueryData(productKeys.detail(storeId, data.id), data)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
}
