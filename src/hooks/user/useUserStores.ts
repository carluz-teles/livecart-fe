"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { userService } from "@/services/api/user.service"
import type { UserStore } from "@/types"

export const userStoresKeys = {
  all: ["user", "stores"] as const,
}

export function useUserStores() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: userStoresKeys.all,
    queryFn: async (): Promise<{ stores: UserStore[] }> => {
      const token = await getToken()
      return userService.getStores(token)
    },
    enabled: isLoaded && isSignedIn,
  })
}
