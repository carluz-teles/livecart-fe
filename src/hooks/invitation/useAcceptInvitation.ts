"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth, useUser } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import type { AcceptInvitationResult } from "@/types"

export function useAcceptInvitation() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteToken: string): Promise<AcceptInvitationResult> => {
      if (!user) throw new Error("User is required")
      const token = await getToken()
      return invitationService.accept(
        inviteToken,
        {
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          name: user.fullName ?? undefined,
          avatarUrl: user.imageUrl ?? undefined,
        },
        token
      )
    },
    onSuccess: () => {
      // Invalidate user stores query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["user", "stores"] })
    },
  })
}
