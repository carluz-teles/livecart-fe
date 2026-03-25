"use client"

import { useQuery } from "@tanstack/react-query"
import { invitationService } from "@/services/api/invitation.service"
import { invitationKeys } from "./useInvitations"
import type { InvitationDetails } from "@/types"

export function useInvitation(inviteToken: string | null) {
  return useQuery({
    queryKey: invitationKeys.detail(inviteToken ?? ""),
    queryFn: async (): Promise<InvitationDetails> => {
      // Public endpoint - no auth required
      return invitationService.getByToken(inviteToken!)
    },
    enabled: !!inviteToken,
  })
}
