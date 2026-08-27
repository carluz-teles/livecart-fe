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

  // `window.print()` congela a página no estado do clique: foto que ainda não
  // chegou sai como quadro vazio no papel, e a lojista só descobre depois de
  // gastar a folha. O documento fica em display:none até a impressão, então
  // essas imagens não estão na tela para o navegador ter buscado sozinho.
  //
  // O teto de 2s é deliberado: foto de produto vem de origem arbitrária (mídia
  // do Instagram, URL colada pelo lojista) e uma origem lenta ou morta não pode
  // impedir a impressão — vencido o prazo, imprime com o que houver. Erro de
  // carga resolve igual: uma URL quebrada não é motivo para segurar as outras.
  const print = useCallback(() => {
    const fotos = [
      ...order.items.map((item) => item.productImage),
      ...(order.waitlist ?? []).map((item) => item.productImage),
    ].filter((url): url is string => Boolean(url))

    if (fotos.length === 0) {
      window.print()
      return
    }

    const carregadas = Promise.all(
      fotos.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new window.Image()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = url
          }),
      ),
    )
    const prazo = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2000)
    })

    void Promise.race([carregadas, prazo]).then(() => window.print())
  }, [order.items, order.waitlist])

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
