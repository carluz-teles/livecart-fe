"use client"

import { use } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"

import { OrderTracking } from "@/components/order-tracking/OrderTracking"
import { usePublicOrder } from "@/hooks/order-tracking/usePublicOrder"

interface PageProps {
  params: Promise<{ shortId: string }>
}

export default function OrderTrackingPage({ params }: PageProps) {
  const { shortId } = use(params)
  const searchParams = useSearchParams()
  const key = searchParams.get("key") ?? ""

  const { data: order, isLoading, isError } = usePublicOrder({
    shortId,
    key,
  })

  if (!key) {
    return <NotFound message="Link inválido. Verifique se você abriu o link completo do email." />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <NotFound message="Pedido não encontrado. O link pode ter expirado ou estar incompleto." />
    )
  }

  return <OrderTracking order={order} trackingKey={key} />
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">
          Não conseguimos abrir este pedido
        </h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}
