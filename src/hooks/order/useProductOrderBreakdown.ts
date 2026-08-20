"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import type { ProductOrderBreakdown } from "@/types"
import { orderKeys } from "./useOrders"

/** "Pedidos com este produto", agrupados por status — alimenta o modal do
 *  produto. Só consulta com o modal aberto (enabled segue o productId). */
export function useProductOrderBreakdown(productId: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: [...orderKeys.all, "product-breakdown", storeId ?? "", productId ?? ""],
    queryFn: async (): Promise<ProductOrderBreakdown> => {
      const token = await getToken()
      return orderService.productBreakdown(storeId!, productId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!productId,
  })
}
