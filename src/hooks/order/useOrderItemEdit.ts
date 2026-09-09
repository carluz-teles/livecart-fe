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

const stepperDebounceMs = 600

interface UseOrderItemEditOptions {
  orderId: string
  enabled: boolean
  syncProcessing?: boolean
}

export interface OrderItemEdit {
  displayQuantity: (itemId: string, serverQuantity: number) => number
  isSaving: (itemId: string) => boolean
  isAnyBusy: boolean
  setQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  addItem: (productId: string, quantity: number) => Promise<void>
  isAdding: boolean
}

export function useOrderItemEdit({ orderId, enabled, syncProcessing = false }: UseOrderItemEditOptions): OrderItemEdit {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<Record<string, number>>({})
  const [inFlight, setInFlight] = useState<Record<string, boolean>>({})
  // A ref takes effect in the click handler, before React renders disabled buttons.
  const claimed = useRef(new Set<string>())
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const editable = useRef(enabled && !syncProcessing)
  editable.current = enabled && !syncProcessing

  useEffect(() => {
    const active = timers.current
    return () => Object.values(active).forEach(clearTimeout)
  }, [])

  const claim = useCallback((id: string) => {
    if (!editable.current || claimed.current.has(id)) return false
    claimed.current.add(id)
    setInFlight((current) => ({ ...current, [id]: true }))
    return true
  }, [])

  const release = useCallback((id: string) => {
    claimed.current.delete(id)
    setInFlight(({ [id]: _, ...rest }) => rest)
    setPending(({ [id]: _, ...rest }) => rest)
  }, [])

  const refresh = useCallback(async () => {
    // Concurrent responses can arrive out of order. Read current server state
    // instead of replacing the detail cache with an older mutation response.
    await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    void queryClient.invalidateQueries({ queryKey: productKeys.all })
  }, [queryClient])

  const describeFailure = (error: unknown) => {
    const apiError = error as ApiError | undefined
    return apiError?.message || apiError?.error || "Confira o pedido antes de tentar novamente."
  }

  const mutation = useMutation({
    mutationFn: async (edit: {
      kind: "set" | "remove" | "add"
      id: string
      quantity: number
      requestId: string
    }): Promise<OrderDetail> => {
      const token = await getToken()
      if (edit.kind === "set") return orderService.setItemQuantity(storeId!, orderId, edit.id, edit.quantity, token, edit.requestId)
      if (edit.kind === "remove") return orderService.removeItem(storeId!, orderId, edit.id, token, edit.requestId)
      return orderService.addItem(storeId!, orderId, { productId: edit.id, quantity: edit.quantity }, token, edit.requestId)
    },
    retry: false,
  })
  const mutateAsync = mutation.mutateAsync

  const send = useCallback(async (kind: "set" | "remove" | "add", id: string, quantity: number) => {
    const lockId = kind === "add" ? "add" : id
    if (!claim(lockId)) return
    try {
      const fresh = await mutateAsync({ kind, id, quantity, requestId: crypto.randomUUID() })
      if (kind !== "set") {
        toast.success(kind === "remove" ? "Remoção salva" : "Produto adicionado", {
          description: fresh.erpItemSync?.pending
            ? "Sincronizando com o ERP. Você pode acompanhar o andamento no pedido."
            : "Pedido atualizado. A cliente precisa escolher o frete novamente.",
        })
      }
    } catch (error) {
      toast.error("Não foi possível confirmar a alteração", { description: describeFailure(error) })
      if (kind === "add") throw error
    } finally {
      // Each invocation owns its cleanup. Per-call mutate callbacks only run
      // for the last observer when several edits are submitted together.
      try {
        await refresh()
      } finally {
        release(lockId)
      }
    }
  }, [claim, mutateAsync, refresh, release])

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    if (!editable.current || claimed.current.has(itemId) || quantity < 1) return
    setPending((current) => ({ ...current, [itemId]: quantity }))
    clearTimeout(timers.current[itemId])
    timers.current[itemId] = setTimeout(() => {
      delete timers.current[itemId]
      if (!editable.current) {
        setPending(({ [itemId]: _, ...rest }) => rest)
        toast.info("Aguarde a sincronização para ajustar esta quantidade.")
        return
      }
      void send("set", itemId, quantity)
    }, stepperDebounceMs)
  }, [send])

  const removeItem = useCallback((itemId: string) => {
    if (!editable.current || claimed.current.has(itemId)) return
    clearTimeout(timers.current[itemId])
    delete timers.current[itemId]
    setPending(({ [itemId]: _, ...rest }) => rest)
    void send("remove", itemId, 0)
  }, [send])

  const addItem = useCallback((productId: string, quantity: number) => send("add", productId, quantity), [send])

  return {
    displayQuantity: (id, serverQuantity) => pending[id] ?? serverQuantity,
    isSaving: (id) => syncProcessing || !!inFlight[id],
    isAnyBusy: syncProcessing || Object.keys(inFlight).length > 0,
    isAdding: !!inFlight.add,
    setQuantity,
    removeItem,
    addItem,
  }
}
