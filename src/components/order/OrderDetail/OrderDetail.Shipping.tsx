"use client"

import { use, useState } from "react"
import { Check, Copy, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { ShippingAddressPayload } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"
import { OrderDetailEditAddress } from "./OrderDetail.EditAddress"

function formatAddress(address: ShippingAddressPayload): string {
  const line1 = [address.street, address.number, address.complement]
    .filter(Boolean)
    .join(", ")
  const line2 = [address.neighborhood, `${address.city}/${address.state}`]
    .filter(Boolean)
    .join(" — ")
  return `${line1}\n${line2}\nCEP ${address.zipCode}`
}

export function OrderDetailShipping() {
  const ctx = use(OrderDetailContext)
  const [copied, setCopied] = useState(false)
  if (!ctx) return null
  const { order } = ctx.state

  const handleCopy = async () => {
    if (!order.shippingAddress) return
    try {
      await navigator.clipboard.writeText(formatAddress(order.shippingAddress))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Não foi possível copiar o endereço")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Truck className="h-4 w-4" />
          Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {order.shippingAddress ? (
          <>
            <p className="text-sm">
              {order.shippingAddress.street}, {order.shippingAddress.number}
              {order.shippingAddress.complement && ` — ${order.shippingAddress.complement}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.neighborhood} · {order.shippingAddress.city}/{order.shippingAddress.state}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              CEP {order.shippingAddress.zipCode}
            </p>
            {order.shipping && (
              <div className="mt-2 rounded-md border bg-muted/30 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{order.shipping.serviceName}</span>
                  <span className="tabular-nums">
                    {order.shipping.freeShipping
                      ? "Grátis"
                      : formatCurrency(order.shipping.costCents)}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {order.shipping.carrier} · {order.shipping.deadlineDays} dias úteis
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Endereço ainda não informado
          </p>
        )}
        <div className="mt-2 flex flex-col gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCopy}
            disabled={!order.shippingAddress}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-3 w-3" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-2 h-3 w-3" />
                Copiar Endereço
              </>
            )}
          </Button>
          <OrderDetailEditAddress />
        </div>
      </CardContent>
    </Card>
  )
}
