"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import { invitationKeys } from "./useInvitations"
import type { InvitationDetails } from "@/types"

export function useInvitation(inviteToken: string | null) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: invitationKeys.detail(inviteToken ?? ""),
    queryFn: async (): Promise<InvitationDetails> => {
      const token = await getToken()
      return invitationService.getByToken(inviteToken!, token)
    },
    enabled: isLoaded && isSignedIn && !!inviteToken,
  })
}
