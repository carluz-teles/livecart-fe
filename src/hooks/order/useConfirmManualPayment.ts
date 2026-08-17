"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "@/hooks/product/useProducts"
import { orderKeys } from "./useOrders"
import type { OrderDetail } from "@/types"

// Confirma um pagamento que entrou por fora do LiveCart.
//
// Invalida a superfície inteira de pedidos porque o pedido troca de bucket (sai
// de "Aguardando pagamento", entra em "Para despachar"), os KPIs mudam e o
// estoque foi lançado no ERP — a lista de produtos também envelhece.
export function useConfirmManualPayment() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = await getToken()
      return orderService.confirmManualPayment(storeId!, id, token)
    },
    onSuccess: (fresh, { id }) => {
      queryClient.setQueryData(orderKeys.detail(storeId ?? "", id), fresh)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
