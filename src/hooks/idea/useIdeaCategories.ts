"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { ideaService } from "@/services/api/idea.service"
import { ideaKeys } from "./keys"
import type { IdeaCategory } from "@/types/idea.types"

export function useIdeaCategories() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ideaKeys.categories(),
    queryFn: async (): Promise<IdeaCategory[]> => {
      const token = await getToken()
      return ideaService.listCategories(token)
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 60, // categories barely change
  })
}
