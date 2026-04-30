"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useUpdateOrder } from "@/hooks/order"
import { useStoreId } from "@/hooks/useUser"
import type { OrderDetail } from "@/types/cart.types"
import { OrderDetailContext, type OrderDetailContextValue } from "./OrderDetailContext"

interface ProviderProps {
  order: OrderDetail
  children: React.ReactNode
}

export function OrderDetailProvider({ order, children }: ProviderProps) {
  const updateOrder = useUpdateOrder()
  const { storeId } = useStoreId()

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

  const value: OrderDetailContextValue = {
    state: { order },
    actions: { refund, isRefunding: updateOrder.isPending, print },
    meta: { storeId: storeId ?? "" },
  }

  return <OrderDetailContext value={value}>{children}</OrderDetailContext>
}
