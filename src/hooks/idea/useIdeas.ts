"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { ideaService } from "@/services/api/idea.service"
import type { ListIdeasParams, ListIdeasResponse } from "@/types/idea.types"
import { ideaKeys } from "./keys"

export function useIdeas(params?: ListIdeasParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ideaKeys.list(params),
    queryFn: async (): Promise<ListIdeasResponse> => {
      const token = await getToken()
      return ideaService.list(params, token)
    },
    enabled: isLoaded && isSignedIn,
  })
}
