"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { invitationService } from "@/services/api/invitation.service"
import { useStoreId } from "@/hooks/useUser"
import type { Invitation } from "@/types"

export const invitationKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationKeys.all, "list"] as const,
  list: (storeId: string) => [...invitationKeys.lists(), storeId] as const,
  details: () => [...invitationKeys.all, "detail"] as const,
  detail: (token: string) => [...invitationKeys.details(), token] as const,
}

export function useInvitations() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: invitationKeys.list(storeId ?? ""),
    queryFn: async (): Promise<{ data: Invitation[] }> => {
      const token = await getToken()
      return invitationService.list(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
