"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productGroupService } from "@/services/api/productGroup.service"
import { useStoreId } from "@/hooks/useUser"
import { productGroupKeys } from "./useProductGroups"
import type { UpdateProductGroupPayload } from "@/types"

interface UpdateArgs {
  id: string
  payload: UpdateProductGroupPayload
}

export function useUpdateProductGroup() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return productGroupService.update(storeId, id, payload, token)
    },
    onSuccess: (_, { id }) => {
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: productGroupKeys.detail(storeId, id),
        })
      }
      queryClient.invalidateQueries({ queryKey: productGroupKeys.lists() })
    },
  })
}
