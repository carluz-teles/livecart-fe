"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import type { AcceptInvitationResult } from "@/types"

export function useAcceptInvitation() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteToken: string): Promise<AcceptInvitationResult> => {
      const authToken = await getToken()
      // Backend gets user info from JWT claims, we just send the invitation token
      return invitationService.accept(inviteToken, authToken)
    },
    onSuccess: () => {
      // Invalidate user stores query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["user", "stores"] })
    },
  })
}
