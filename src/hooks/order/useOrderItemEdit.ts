"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { orderService } from "@/services/api/order.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "./useOrders"
import { productKeys } from "@/hooks/product/useProducts"
import type { ApiError } from "@/types/api.types"
import type { OrderDetail } from "@/types"

// Edição dos itens de um pedido aguardando pagamento.
//
// Cada operação é uma ida ao servidor que MOVE ESTOQUE de verdade: baixa (ou
// devolve) unidade no LiveCart e lança reserva no ERP, atravessando o limitador
// de ~1 requisição por segundo do Tiny. Isso governa o desenho inteiro deste
// hook:
//
//   • o stepper acumula localmente e manda UMA requisição — clicar "+" três
//     vezes é quantidade 4, não três lançamentos de estoque em fila;
//   • cada linha tem estado próprio de "salvando", porque a resposta demora e
//     travar a tela inteira faria a lojista achar que travou;
//   • falha volta ao valor do servidor e diz o motivo — estoque insuficiente,
//     teto do produto e "mudou enquanto você editava" pedem ações diferentes.

// stepperDebounceMs é a janela em que os cliques no stepper viram um só envio.
//
// 600ms é longo para um input de texto e curto para um clique deliberado: cobre
// a rajada de quem ajusta de 2 para 5 sem deixar a lojista esperando depois do
// último clique.
const stepperDebounceMs = 600

interface UseOrderItemEditOptions {
  orderId: string
  /** Falso para pedido pago/cancelado/expirado: a tela nem oferece a edição. */
  enabled: boolean
}

export interface OrderItemEdit {
  /** Quantidade a MOSTRAR na linha: o valor pendente do stepper, se houver. */
  displayQuantity: (itemId: string, serverQuantity: number) => number
  /**
   * Esta linha tem requisição EM VOO — trava os controles e mostra o spinner.
   *
   * Não inclui a espera do debounce, e a diferença é a feature: travar durante o
   * debounce impede o segundo clique, e sem o segundo clique acumular não existe
   * (ir de 2 para 5 viraria uma alteração para 3 e mais nada). Enquanto a janela
   * corre, o stepper continua clicável mostrando o número que ela está montando.
   */
  isSaving: (itemId: string) => boolean
  /** Alguma requisição em voo — trava o "Adicionar produto" durante uma edição. */
  isAnyBusy: boolean
  setQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  addItem: (productId: string, quantity: number) => Promise<void>
  isAdding: boolean
}

export function useOrderItemEdit({
  orderId,
  enabled,
}: UseOrderItemEditOptions): OrderItemEdit {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  // Quantidade que a lojista está montando, por item, antes do envio.
  const [pending, setPending] = useState<Record<string, number>>({})
  // Itens com requisição em voo — separado de `pending` porque o valor sai de
  // `pending` no momento do envio e a linha precisa continuar travada.
  const [inFlight, setInFlight] = useState<Record<string, boolean>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Timer pendente numa linha que sai da tela (a lojista navegou) enviaria uma
  // alteração que ela não vê acontecer. Limpar no unmount evita isso.
  useEffect(() => {
    const pendentes = timers.current
    return () => {
      Object.values(pendentes).forEach(clearTimeout)
    }
  }, [])

  // A resposta é o pedido inteiro relido: escreve no cache do detalhe e
  // invalida a superfície de pedidos (o total mudou, então as abas e os KPIs
  // também) e a de produtos (o estoque mudou).
  const applyFreshOrder = useCallback(
    (fresh: OrderDetail) => {
      queryClient.setQueryData(orderKeys.detail(storeId ?? "", orderId), fresh)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    [queryClient, storeId, orderId],
  )

  const describeFailure = useCallback((error: unknown): string => {
    const apiError = error as ApiError | undefined
    // A mensagem do servidor é específica e acionável ("apenas 2 em estoque",
    // "a quantidade deste item mudou enquanto você editava"). Substituí-la por
    // um texto genérico apagaria exatamente o que a lojista precisa saber.
    return apiError?.message || apiError?.error || "Não foi possível alterar o item"
  }, [])

  const quantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const token = await getToken()
      return orderService.setItemQuantity(storeId!, orderId, itemId, quantity, token)
    },
  })

  const removeMutation = useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => {
      const token = await getToken()
      return orderService.removeItem(storeId!, orderId, itemId, token)
    },
  })

  const addMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => {
      const token = await getToken()
      return orderService.addItem(storeId!, orderId, { productId, quantity }, token)
    },
  })

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (!enabled || quantity < 1) return

      setPending((atual) => ({ ...atual, [itemId]: quantity }))

      clearTimeout(timers.current[itemId])
      timers.current[itemId] = setTimeout(() => {
        delete timers.current[itemId]
        setInFlight((atual) => ({ ...atual, [itemId]: true }))

        quantityMutation.mutate(
          { itemId, quantity },
          {
            onSuccess: (fresh) => {
              applyFreshOrder(fresh)
              // O pendente sai só agora: enquanto a requisição corria, ele era o
              // número na tela. Tirá-lo antes faria a linha piscar o valor antigo.
              setPending(({ [itemId]: _, ...resto }) => resto)
            },
            onError: (error) => {
              // Volta para o valor do servidor descartando o pendente — insistir
              // num número que o servidor recusou é o caminho para a lojista
              // achar que salvou.
              setPending(({ [itemId]: _, ...resto }) => resto)
              toast.error("Quantidade não alterada", {
                description: describeFailure(error),
              })
            },
            onSettled: () => {
              setInFlight(({ [itemId]: _, ...resto }) => resto)
            },
          },
        )
      }, stepperDebounceMs)
    },
    [enabled, quantityMutation, applyFreshOrder, describeFailure],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      if (!enabled) return
      // Um stepper pendente nesta linha perdeu o sentido — o item vai sair.
      clearTimeout(timers.current[itemId])
      delete timers.current[itemId]
      setPending(({ [itemId]: _, ...resto }) => resto)
      setInFlight((atual) => ({ ...atual, [itemId]: true }))

      removeMutation.mutate(
        { itemId },
        {
          onSuccess: (fresh) => {
            applyFreshOrder(fresh)
            toast.success("Item removido", {
              description: "O estoque voltou para o catálogo.",
            })
          },
          onError: (error) => {
            toast.error("Item não removido", { description: describeFailure(error) })
          },
          onSettled: () => {
            setInFlight(({ [itemId]: _, ...resto }) => resto)
          },
        },
      )
    },
    [enabled, removeMutation, applyFreshOrder, describeFailure],
  )

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!enabled) return
      try {
        const fresh = await addMutation.mutateAsync({ productId, quantity })
        applyFreshOrder(fresh)
        toast.success("Produto adicionado", {
          description:
            "O estoque foi reservado. A cliente precisa escolher o frete de novo.",
        })
      } catch (error) {
        toast.error("Produto não adicionado", {
          description: describeFailure(error),
        })
        throw error
      }
    },
    [enabled, addMutation, applyFreshOrder, describeFailure],
  )

  const displayQuantity = useCallback(
    (itemId: string, serverQuantity: number) => pending[itemId] ?? serverQuantity,
    [pending],
  )

  const isSaving = useCallback(
    (itemId: string) => !!inFlight[itemId],
    [inFlight],
  )

  return {
    displayQuantity,
    isSaving,
    // `pending` fica FORA: com ele aqui, começar a ajustar uma quantidade
    // desabilitava o botão de adicionar produto por 600ms sem nada em voo.
    isAnyBusy: Object.keys(inFlight).length > 0 || addMutation.isPending,
    setQuantity,
    removeItem,
    addItem,
    isAdding: addMutation.isPending,
  }
}
