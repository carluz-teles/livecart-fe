"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { memberService } from "@/services/api/member.service"
import { useStoreId } from "@/hooks/useUser"
import type { Member } from "@/types"

export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (storeId: string) => [...memberKeys.lists(), storeId] as const,
}

export function useMembers() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: memberKeys.list(storeId ?? ""),
    queryFn: async (): Promise<{ data: Member[] }> => {
      const token = await getToken()
      return memberService.list(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
