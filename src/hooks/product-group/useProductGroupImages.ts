"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productGroupService } from "@/services/api/productGroup.service"
import { useStoreId } from "@/hooks/useUser"
import { productGroupKeys } from "./useProductGroups"
import type { AddProductGroupImagePayload } from "@/types"

interface AddImageArgs {
  groupId: string
  payload: AddProductGroupImagePayload
}

export function useAddProductGroupImage() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, payload }: AddImageArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return productGroupService.addImage(storeId, groupId, payload, token)
    },
    onSuccess: (_, { groupId }) => {
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: productGroupKeys.detail(storeId, groupId),
        })
      }
    },
  })
}

interface RemoveImageArgs {
  groupId: string
  imageId: string
}

export function useRemoveProductGroupImage() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, imageId }: RemoveImageArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return productGroupService.removeImage(storeId, groupId, imageId, token)
    },
    onSuccess: (_, { groupId }) => {
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: productGroupKeys.detail(storeId, groupId),
        })
      }
    },
  })
}
