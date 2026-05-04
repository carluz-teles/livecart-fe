"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { ideaService } from "@/services/api/idea.service"
import { ideaKeys } from "./keys"

// Prefetches the idea detail behind the staleTime gate set on useIdea, so
// repeat hovers over the same card don't fan out to the API.
export function usePrefetchIdea() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ideaKeys.detail(id),
        queryFn: async () => {
          const token = await getToken()
          return ideaService.getById(id, token)
        },
        staleTime: 30_000,
      })
    },
    [queryClient, getToken],
  )
}
