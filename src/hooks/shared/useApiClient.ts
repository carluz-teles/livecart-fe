"use client"

import { useAuth } from "@clerk/nextjs"
import { useMemo } from "react"
import { createAuthenticatedClient } from "@/services/api/client"

export function useApiClient() {
  const { getToken } = useAuth()

  const client = useMemo(
    () => createAuthenticatedClient(getToken),
    [getToken]
  )

  return client
}
