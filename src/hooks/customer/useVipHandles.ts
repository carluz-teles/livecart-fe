"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "@/hooks/order"
import { customerKeys } from "./useCustomers"
import type { VipHandle, VipHandlesResponse, AddVipPayload } from "@/types"

// useVipHandles carrega a lista de clientes VIP da loja. Volume baixo (uma lista
// curada), então paginamos generosamente e não fazemos round-trip por @.
export function useVipHandles(includeInactive = false) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: customerKeys.vip(storeId ?? "", includeInactive),
    queryFn: async (): Promise<VipHandlesResponse> => {
      const token = await getToken()
      return customerService.listVips(storeId!, { includeInactive, limit: 500 }, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}

export function useAddVip() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (payload: AddVipPayload): Promise<VipHandle> => {
      const token = await getToken()
      return customerService.addVip(storeId!, payload, token)
    },
    onSuccess: () => {
      // Promover a VIP torna eternos os carrinhos abertos existentes — invalida
      // clientes e pedidos para o estado novo aparecer sem reload.
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useRemoveVip() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async (handle: string): Promise<VipHandle> => {
      const token = await getToken()
      return customerService.removeVip(storeId!, handle, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
