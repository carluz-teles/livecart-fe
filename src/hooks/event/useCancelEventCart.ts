"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "@/hooks/order/useOrders"
import type { OrderDetail } from "@/types"
import type { ApiError } from "@/types/api.types"
import { eventKeys } from "./useEvents"

// Cancela um carrinho a partir da aba de carrinhos do evento — que é onde o
// lojista efetivamente enxerga carrinhos NÃO PAGOS (a lista de /orders só
// mostra pedidos já materializados, ou seja, pagos). O endpoint é o mesmo do
// detalhe do pedido; o que muda aqui é o que precisa ser invalidado.
export function useCancelEventCart(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation<OrderDetail, Error, { cartId: string; handle: string }>({
    mutationFn: async ({ cartId }) => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return orderService.cancel(storeId, cartId, token)
    },
    onSuccess: (_cancelled, { handle }) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.detailCarts(storeId ?? "", eventId),
      })
      // O evento também expõe contadores/estatísticas que mudam com a
      // devolução do estoque, e o pedido pode estar aberto em outra aba.
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success("Carrinho cancelado", {
        description: `O estoque de @${handle} voltou e o link não aceita mais pagamento.`,
      })
    },
    onError: (error) => {
      // 409 aqui é a corrida com o pagamento sendo resolvida a favor do
      // pagamento — a mensagem do backend explica o caso ao lojista.
      const apiError = error as unknown as ApiError
      if (apiError?.status === 409) {
        toast.error("Não foi possível cancelar", {
          description: apiError.message || apiError.error,
        })
        return
      }
      toast.error("Falha ao cancelar o carrinho")
    },
  })
}
