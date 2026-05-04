"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { ideaService } from "@/services/api/idea.service"
import { ideaKeys } from "./keys"
import type { IdeaDetail } from "@/types/idea.types"

export function useIdea(id: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ideaKeys.detail(id ?? ""),
    queryFn: async (): Promise<IdeaDetail> => {
      const token = await getToken()
      return ideaService.getById(id!, token)
    },
    enabled: !!id && isLoaded && isSignedIn,
    staleTime: 30_000,
  })
}
