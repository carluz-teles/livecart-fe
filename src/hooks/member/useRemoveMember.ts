"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { memberService } from "@/services/api/member.service"
import { useStoreId } from "@/hooks/useUser"
import { memberKeys } from "./useMembers"

export function useRemoveMember() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return memberService.remove(storeId, memberId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() })
    },
  })
}
