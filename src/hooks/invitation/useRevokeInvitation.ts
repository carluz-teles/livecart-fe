"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import { useStoreId } from "@/hooks/useUser"
import { invitationKeys } from "./useInvitations"

export function useRevokeInvitation() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return invitationService.revoke(storeId, invitationId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() })
    },
  })
}
