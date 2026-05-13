"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "@/hooks/order"
import { customerKeys } from "./useCustomers"
import type { BlockedHandle, BlockedHandlesResponse, BlockHandlePayload } from "@/types"

interface UseBlockedHandlesOptions {
  includeInactive?: boolean
  enabled?: boolean
}

// useBlockedHandles loads the full block list for the current store. Volume
// stays low (dozens of rows typical), so we paginate generously and filter
// client-side via useBlockedHandle below instead of round-tripping per handle.
export function useBlockedHandles(options: UseBlockedHandlesOptions = {}) {
  const { includeInactive = false, enabled = true } = options
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: customerKeys.blocked(storeId ?? "", includeInactive),
    queryFn: async (): Promise<BlockedHandlesResponse> => {
      const token = await getToken()
      return customerService.listBlocked(
        storeId!,
        { includeInactive, limit: 500 },
        token,
      )
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}

// useBlockedHandle is a derived selector: returns the BlockedHandle row for
// the given handle, or null. Lower-case match to mirror BE normalization.
export function useBlockedHandle(handle: string | undefined) {
  const { data } = useBlockedHandles({ enabled: !!handle })
  return useMemo(() => {
    if (!handle || !data?.data) return null
    const normalized = handle.replace(/^@/, "").toLowerCase()
    return data.data.find((b) => b.handle.toLowerCase() === normalized) ?? null
  }, [data, handle])
}

export function useBlockHandle() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (payload: BlockHandlePayload): Promise<BlockedHandle> => {
      const token = await getToken()
      return customerService.block(storeId!, payload, token)
    },
    onSuccess: () => {
      // The block sweep cancels open carts, releases stock and promotes
      // waitlist — invalidate everything customer/order-facing so the UI
      // reflects the new state without a manual reload.
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useUnblockHandle() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (handle: string): Promise<BlockedHandle> => {
      const token = await getToken()
      return customerService.unblock(storeId!, handle, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
