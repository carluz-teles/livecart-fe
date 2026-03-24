"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import { useStoreId } from "@/hooks/useUser"
import { invitationKeys } from "./useInvitations"
import type { Invitation, CreateInvitationPayload } from "@/types"

export function useCreateInvitation() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateInvitationPayload): Promise<Invitation> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return invitationService.create(storeId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() })
    },
  })
}
