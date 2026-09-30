"use client"

import { useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkoutService } from "@/services/api/checkout.service"
import { checkoutKeys } from "./useCheckoutCart"
import type { ApiError, PublicCheckoutCart } from "@/types"
import { getPayableItemTotal } from "@/lib/cart-item-prices"

interface MutationArgs {
  token: string
}

interface UpdateQuantityArgs extends MutationArgs {
  itemId: string
  quantity: number
}

interface RemoveItemArgs extends MutationArgs {
  itemId: string
}

interface AddItemArgs extends MutationArgs {
  productId: string
  quantity: number
}

interface DropFromWaitlistArgs extends MutationArgs {
  waitlistItemId: string
}

function errorMessage(err: unknown, fallback: string): string {
  const apiErr = err as Partial<ApiError> | null
  if (apiErr?.message) return apiErr.message
  if (apiErr?.error) return apiErr.error
  return fallback
}

/** Detects the BE "estoque insuficiente" 422 so the buyer sees a calmer
 *  amber-toned toast with context instead of a red generic error. The check
 *  is loose on purpose — the BE owns the copy. */
function isInsufficientStockError(err: unknown): boolean {
  const apiErr = err as Partial<ApiError> | null
  if (apiErr?.status !== 422) return false
  const msg = (apiErr.message ?? apiErr.error ?? "").toLowerCase()
  return msg.includes("estoque")
}

function showStockExhaustedToast() {
  toast.warning("Esse produto acabou de esgotar", {
    description:
      "Outro cliente fechou a última unidade enquanto você editava. Seu carrinho voltou ao valor anterior.",
    duration: 6000,
  })
}

// Retrying the same mutation keeps its command identity; another user action
// receives a new key. Weak references avoid keeping finished carts in memory.
function useEditRequestId() {
  const requests = useRef(new WeakMap<object, string>())
  return (command: object) => {
    let id = requests.current.get(command)
    if (!id) {
      id = crypto.randomUUID()
      requests.current.set(command, id)
    }
    return id
  }
}

function notifySavedEdit(cart: PublicCheckoutCart, completed?: string) {
  if (cart.erpItemSync?.blocked) {
    toast.warning("Alteração salva; pedido precisa de conferência", {
      description: "Fale com a loja antes de continuar o pagamento.",
    })
  } else if (cart.erpItemSync?.pending) {
    toast.info("Alteração salva", {
      description: "Aguardando confirmação dos itens. A tela será atualizada automaticamente.",
    })
  } else if (completed) {
    toast.success(completed)
  }
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient()
  const requestId = useEditRequestId()

  return useMutation<
    PublicCheckoutCart,
    ApiError,
    UpdateQuantityArgs,
    { previous?: PublicCheckoutCart }
  >({
    mutationFn: (command) =>
      checkoutService.updateItemQuantity(command.token, command.itemId, command.quantity, requestId(command)),
    retry: false,
    onMutate: async ({ token, itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: checkoutKeys.cart(token) })
      const previous = queryClient.getQueryData<PublicCheckoutCart>(
        checkoutKeys.cart(token)
      )
      if (previous) {
        // O servidor decide quais lotes mudam e o preço das novas unidades.
        // O estado de carregamento já aparece no stepper; não inventar um total.
        if (previous.items.find((it) => it.id === itemId)?.priceLots?.length) {
          return { previous }
        }
        const items = previous.items.map((it) =>
          it.id === itemId
            ? { ...it, quantity, totalPrice: it.unitPrice * quantity }
            : it
        )
        const subtotal = items.reduce(
          (acc, it) => acc + getPayableItemTotal(it),
          0
        )
        queryClient.setQueryData<PublicCheckoutCart>(
          checkoutKeys.cart(token),
          {
            ...previous,
            items,
            summary: {
              ...previous.summary,
              subtotal,
              total: subtotal + (previous.summary.shippingCost ?? 0),
              totalItems: items.reduce(
                (acc, it) =>
                  acc + Math.max(it.quantity - it.waitlistedQuantity, 0),
                0
              ),
            },
          }
        )
      }
      return { previous }
    },
    onError: (err, { token }, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(checkoutKeys.cart(token), ctx.previous)
      }
      if (isInsufficientStockError(err)) {
        showStockExhaustedToast()
        return
      }
      toast.error(errorMessage(err, "Não foi possível atualizar o item"))
    },
    onSuccess: (data, { token }) => {
      queryClient.setQueryData(checkoutKeys.cart(token), data)
      notifySavedEdit(data)
    },
    onSettled: (_data, _err, { token }) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.cart(token) })
    },
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  const requestId = useEditRequestId()

  return useMutation<
    PublicCheckoutCart,
    ApiError,
    RemoveItemArgs,
    { previous?: PublicCheckoutCart }
  >({
    mutationFn: (command) =>
      checkoutService.removeItem(command.token, command.itemId, requestId(command)),
    retry: false,
    onMutate: async ({ token, itemId }) => {
      await queryClient.cancelQueries({ queryKey: checkoutKeys.cart(token) })
      const previous = queryClient.getQueryData<PublicCheckoutCart>(
        checkoutKeys.cart(token)
      )
      if (previous) {
        const items = previous.items.filter((it) => it.id !== itemId)
        const subtotal = items.reduce(
          (acc, it) => acc + getPayableItemTotal(it),
          0
        )
        queryClient.setQueryData<PublicCheckoutCart>(
          checkoutKeys.cart(token),
          {
            ...previous,
            items,
            summary: {
              ...previous.summary,
              subtotal,
              total: subtotal + (previous.summary.shippingCost ?? 0),
              totalItems: items.reduce(
                (acc, it) =>
                  acc + Math.max(it.quantity - it.waitlistedQuantity, 0),
                0
              ),
            },
          }
        )
      }
      return { previous }
    },
    onError: (err, { token }, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(checkoutKeys.cart(token), ctx.previous)
      }
      toast.error(errorMessage(err, "Não foi possível remover o item"))
    },
    onSuccess: (data, { token }) => {
      queryClient.setQueryData(checkoutKeys.cart(token), data)
      notifySavedEdit(data, "Item removido")
    },
    onSettled: (_data, _err, { token }) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.cart(token) })
    },
  })
}

export function useDropFromWaitlist() {
  const queryClient = useQueryClient()

  return useMutation<
    PublicCheckoutCart,
    ApiError,
    DropFromWaitlistArgs,
    { previous?: PublicCheckoutCart }
  >({
    mutationFn: ({ token, waitlistItemId }) =>
      checkoutService.dropFromWaitlist(token, waitlistItemId),
    onMutate: async ({ token, waitlistItemId }) => {
      await queryClient.cancelQueries({ queryKey: checkoutKeys.cart(token) })
      const previous = queryClient.getQueryData<PublicCheckoutCart>(
        checkoutKeys.cart(token),
      )
      if (previous) {
        queryClient.setQueryData<PublicCheckoutCart>(
          checkoutKeys.cart(token),
          {
            ...previous,
            waitlistItems: previous.waitlistItems.filter(
              (w) => w.id !== waitlistItemId,
            ),
          },
        )
      }
      return { previous }
    },
    onError: (err, { token }, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(checkoutKeys.cart(token), ctx.previous)
      }
      toast.error(errorMessage(err, "Não foi possível sair da fila"))
    },
    onSuccess: (data, { token }) => {
      queryClient.setQueryData(checkoutKeys.cart(token), data)
      toast.success("Você saiu da fila desse produto")
    },
    onSettled: (_data, _err, { token }) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.cart(token) })
    },
  })
}

export function useAddCartItem() {
  const queryClient = useQueryClient()
  const requestId = useEditRequestId()

  return useMutation<PublicCheckoutCart, ApiError, AddItemArgs>({
    mutationFn: (command) =>
      checkoutService.addItem(command.token, command.productId, command.quantity, requestId(command)),
    retry: false,
    onError: (err) => {
      if (isInsufficientStockError(err)) {
        showStockExhaustedToast()
        return
      }
      toast.error(errorMessage(err, "Não foi possível adicionar o produto"))
    },
    onSuccess: (data, { token }) => {
      queryClient.setQueryData(checkoutKeys.cart(token), data)
      notifySavedEdit(data, "Produto adicionado")
    },
    onSettled: (_data, _err, { token }) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.cart(token) })
    },
  })
}
