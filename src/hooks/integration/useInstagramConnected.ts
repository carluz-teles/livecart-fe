"use client"

import { useIntegrations } from "./useIntegrations"

// Events exist to turn Instagram comments into orders, so an active Instagram
// account is a hard prerequisite for the whole Events area.
export function useInstagramConnected() {
  const { data, isLoading, isError } = useIntegrations()

  const isConnected = (data?.data ?? []).some(
    (integration) =>
      integration.provider === "instagram" && integration.status === "active"
  )

  return { isConnected, isLoading, isError }
}
