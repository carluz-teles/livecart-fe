"use client"

import { useParams } from "next/navigation"

import { useOrder } from "@/hooks/order"
import { OrderDetail } from "@/components/order/OrderDetail"

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: order, isLoading, error } = useOrder(params.id)

  if (isLoading) return <OrderDetail.Skeleton />
  if (error || !order) return <OrderDetail.NotFound />

  return (
    <OrderDetail.Provider order={order}>
      <OrderDetail.Frame>
        <OrderDetail.Header />
        <OrderDetail.Body />
      </OrderDetail.Frame>
    </OrderDetail.Provider>
  )
}
