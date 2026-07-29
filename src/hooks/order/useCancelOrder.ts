"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "./useOrders"
import type { OrderDetail } from "@/types"

// Cancela um pedido não pago. O BE devolve o OrderDetail já cancelado, então
// escrevemos direto no cache do detalhe e invalidamos toda a superfície de
// pedidos: as abas, os contadores e os KPIs mudam de bucket com o
// cancelamento (o pedido sai de "Aguardando pagamento" e entra em
// "Cancelados"), e uma invalidação mais estreita deixaria as pílulas velhas.
export function useCancelOrder() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = await getToken()
      return orderService.cancel(storeId!, id, token)
    },
    onSuccess: (cancelled, { id }) => {
      queryClient.setQueryData(orderKeys.detail(storeId ?? "", id), cancelled)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
