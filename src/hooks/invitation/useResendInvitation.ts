"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import { useStoreId } from "@/hooks/useUser"
import { invitationKeys } from "./useInvitations"
import type { Invitation } from "@/types"

export function useResendInvitation() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string): Promise<Invitation> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return invitationService.resend(storeId, invitationId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() })
    },
  })
}
