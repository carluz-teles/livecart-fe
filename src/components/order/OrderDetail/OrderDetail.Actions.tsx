"use client"

import { use, useState } from "react"
import { CheckCircle2, Hash, Link2, MoreHorizontal, Printer, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrderDetailContext } from "./OrderDetailContext"

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export function OrderDetailActions() {
  const ctx = use(OrderDetailContext)
  const [refundOpen, setRefundOpen] = useState(false)
  if (!ctx) return null
  const { order } = ctx.state
  const {
    refund,
    isRefunding,
    print,
    requestRegenerate,
    markDelivered,
    isMarkingDelivered,
  } = ctx.actions

  // Show "Marcar como entregue" only when the order has been paid AND there
  // is a shipment, AND it hasn't already been marked delivered. The BE is
  // idempotent on order_events, so a misclick is harmless — but hiding the
  // entry keeps the menu honest.
  const canMarkDelivered =
    order.paymentStatus === "paid" &&
    !!order.shipment &&
    order.shipmentStatus !== "delivered"

  const checkoutUrl = order.token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cart/${order.token}`
    : ""

  // Both link entries only make sense before payment / shipment — backend
  // returns 409 in those states anyway, but hiding the entries keeps the
  // menu honest about what's available.
  const canShareLink = order.paymentStatus !== "paid" && !order.shipment

  const handleCopyShortId = async () => {
    const ok = await copyToClipboard(`#${order.shortId}`)
    if (ok) toast.success(`#${order.shortId} copiado`)
    else toast.error("Não foi possível copiar")
  }

  const handleCopyCheckoutLink = async () => {
    if (!checkoutUrl) return
    const ok = await copyToClipboard(checkoutUrl)
    if (ok) toast.success("Link copiado", { description: checkoutUrl })
    else toast.error("Não foi possível copiar o link")
  }

  const handleRefundConfirm = () => {
    refund()
    setRefundOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Mais ações">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={handleCopyShortId}>
            <Hash className="mr-2 h-4 w-4" />
            Copiar #{order.shortId}
          </DropdownMenuItem>
          {canShareLink && checkoutUrl && (
            <DropdownMenuItem onSelect={handleCopyCheckoutLink}>
              <Link2 className="mr-2 h-4 w-4" />
              Copiar link do checkout
            </DropdownMenuItem>
          )}
          {canShareLink && (
            <DropdownMenuItem onSelect={requestRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regerar link
            </DropdownMenuItem>
          )}
          {canMarkDelivered && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={markDelivered}
                disabled={isMarkingDelivered}
                className="text-emerald-700 focus:text-emerald-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar como entregue
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={print}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </DropdownMenuItem>
          {order.paymentStatus === "paid" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRefundOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Marcar como reembolsado
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reembolsar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido será marcado como reembolsado. Essa ação não estorna o
              pagamento automaticamente — faça o reembolso no provedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefundConfirm}
              disabled={isRefunding}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRefunding ? "Reembolsando..." : "Reembolsar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
