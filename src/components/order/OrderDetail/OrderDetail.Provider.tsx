"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import {
  useCancelOrder,
  useMarkDelivered,
  useRegenerateCheckout,
  useUpdateOrder,
} from "@/hooks/order"
import type { ApiError } from "@/types/api.types"
import { useStoreId } from "@/hooks/useUser"
import type { OrderDetail } from "@/types/cart.types"
import {
  OrderDetailContext,
  type OrderDetailContextValue,
  type RegenerateShareState,
} from "./OrderDetailContext"
import { OrderDetailRegenerateController } from "./OrderDetail.RegenerateController"

interface ProviderProps {
  order: OrderDetail
  children: React.ReactNode
}

export function OrderDetailProvider({ order, children }: ProviderProps) {
  const updateOrder = useUpdateOrder()
  const regenerate = useRegenerateCheckout()
  const markDeliveredMutation = useMarkDelivered()
  const cancelOrderMutation = useCancelOrder()
  const { storeId } = useStoreId()

  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false)
  const [regenerateShare, setRegenerateShare] =
    useState<RegenerateShareState | null>(null)

  const refund = useCallback(() => {
    updateOrder.mutate(
      { id: order.id, paymentStatus: "refunded" },
      {
        onSuccess: () => toast.success("Pedido marcado como reembolsado"),
        onError: () => toast.error("Falha ao reembolsar pedido"),
      },
    )
  }, [order.id, updateOrder])

  const print = useCallback(() => {
    window.print()
  }, [])

  const requestRegenerate = useCallback(() => {
    setRegenerateConfirmOpen(true)
  }, [])

  const cancelRegenerate = useCallback(() => {
    setRegenerateConfirmOpen(false)
  }, [])

  const confirmRegenerate = useCallback(() => {
    regenerate.mutate(
      { id: order.id },
      {
        onSuccess: (data) => {
          const url = `${window.location.origin}/cart/${data.token}`
          setRegenerateConfirmOpen(false)
          setRegenerateShare({ url, expiresAt: data.expiresAt })
        },
        onError: () => {
          toast.error("Falha ao regerar link")
          setRegenerateConfirmOpen(false)
        },
      },
    )
  }, [order.id, regenerate])

  const closeRegenerateShare = useCallback(() => {
    setRegenerateShare(null)
  }, [])

  const markDelivered = useCallback(() => {
    markDeliveredMutation.mutate(
      { id: order.id },
      {
        onSuccess: () => toast.success("Pedido marcado como entregue"),
        onError: () => toast.error("Falha ao marcar como entregue"),
      },
    )
  }, [order.id, markDeliveredMutation])

  // O 409 aqui não é erro de sistema: é a corrida cancelamento × pagamento
  // sendo resolvida a favor do pagamento. A mensagem vem pronta do backend
  // ("já foi pago", "pagamento em processamento") e é o que o lojista precisa
  // ler para entender por que o pedido continua de pé.
  const cancelOrder = useCallback(() => {
    cancelOrderMutation.mutate(
      { id: order.id },
      {
        onSuccess: () =>
          toast.success("Carrinho cancelado", {
            description: "O estoque foi devolvido e o link não aceita mais pagamento.",
          }),
        onError: (error) => {
          const apiError = error as unknown as ApiError
          if (apiError?.status === 409) {
            toast.error("Não foi possível cancelar", {
              description: apiError.message || apiError.error,
            })
            return
          }
          toast.error("Falha ao cancelar o carrinho")
        },
      },
    )
  }, [order.id, cancelOrderMutation])

  const value: OrderDetailContextValue = {
    state: {
      order,
      regenerate: {
        confirmOpen: regenerateConfirmOpen,
        share: regenerateShare,
        isPending: regenerate.isPending,
      },
    },
    actions: {
      refund,
      isRefunding: updateOrder.isPending,
      print,
      requestRegenerate,
      cancelRegenerate,
      confirmRegenerate,
      closeRegenerateShare,
      markDelivered,
      isMarkingDelivered: markDeliveredMutation.isPending,
      cancelOrder,
      isCancelling: cancelOrderMutation.isPending,
    },
    meta: { storeId: storeId ?? "" },
  }

  return (
    <OrderDetailContext value={value}>
      {children}
      <OrderDetailRegenerateController />
    </OrderDetailContext>
  )
}
