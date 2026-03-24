"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { storeService } from "@/services/api/store.service"
import type { Store } from "@/types/store.types"

export const storeKeys = {
  all: ["store"] as const,
  current: () => [...storeKeys.all, "current"] as const,
}

export function useStore() {
  const { getToken } = useAuth()

  return useQuery<Store>({
    queryKey: storeKeys.current(),
    queryFn: async () => {
      const token = await getToken()
      return storeService.getCurrent(token)
    },
  })
}
