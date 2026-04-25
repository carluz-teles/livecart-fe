"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productGroupService } from "@/services/api/productGroup.service"
import { useStoreId } from "@/hooks/useUser"
import { productGroupKeys } from "./useProductGroups"
import { productKeys } from "@/hooks/product/useProducts"

export function useDeleteProductGroup() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return productGroupService.delete(storeId, id, token)
    },
    onSuccess: () => {
      // Variants stay alive (orphaned with groupId=null) — refresh the
      // product list so they show up correctly without the group banner.
      queryClient.invalidateQueries({ queryKey: productGroupKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
