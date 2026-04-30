"use client"

import { use } from "react"
import { ExternalLink, Mail, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderDetailContext } from "./OrderDetailContext"

export function OrderDetailCustomer() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  const platformLabel =
    order.livePlatform === "instagram"
      ? "Instagram"
      : order.livePlatform.charAt(0).toUpperCase() + order.livePlatform.slice(1)

  const handleOpenInstagramProfile = () => {
    if (order.customerHandle) {
      window.open(`https://instagram.com/${order.customerHandle}`, "_blank")
    }
  }

  const handleOpenWhatsApp = () => {
    if (!order.customer?.phone) return
    const digits = order.customer.phone.replace(/\D/g, "")
    window.open(`https://wa.me/${digits}`, "_blank")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4" />
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {order.customer?.name ? (
          <>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-xs text-muted-foreground">
              @{order.customerHandle} · {platformLabel}
            </p>
            {order.customer.email && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{order.customer.email}</span>
              </p>
            )}
            {order.customer.phone && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                {order.customer.phone}
              </p>
            )}
            {order.customer.document && (
              <p className="font-mono text-xs text-muted-foreground">
                {order.customer.document}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-medium">@{order.customerHandle}</p>
            <p className="text-sm text-muted-foreground">{platformLabel}</p>
            <p className="text-xs text-muted-foreground">
              Cliente ainda não preencheu o checkout
            </p>
          </>
        )}
        <div className="flex gap-2 pt-2 print:hidden">
          {order.customerHandle && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleOpenInstagramProfile}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Perfil
            </Button>
          )}
          {order.customer?.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleOpenWhatsApp}
            >
              <Phone className="mr-2 h-3 w-3" />
              WhatsApp
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
