"use client"

import { use, useState } from "react"
import { Link2, MoreHorizontal, Printer } from "lucide-react"
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
import { useRegenerateCheckout } from "@/hooks/order"
import { OrderDetailContext } from "./OrderDetailContext"

export function OrderDetailActions() {
  const ctx = use(OrderDetailContext)
  const [refundOpen, setRefundOpen] = useState(false)
  const [resendOpen, setResendOpen] = useState(false)
  const regenerate = useRegenerateCheckout()
  if (!ctx) return null
  const { order } = ctx.state
  const { refund, isRefunding, print } = ctx.actions

  const handleRefundConfirm = () => {
    refund()
    setRefundOpen(false)
  }

  // Resend is only meaningful when the buyer hasn't paid yet AND no shipment
  // has been created (which the backend also enforces with 409 conflicts).
  const canResend =
    order.paymentStatus !== "paid" && !order.shipment

  const handleResendConfirm = () => {
    regenerate.mutate(
      { id: order.id },
      {
        onSuccess: async (data) => {
          const url = `${window.location.origin}/cart/${data.token}`
          // Best effort copy to clipboard so the merchant can paste straight
          // into WhatsApp / Instagram. We tolerate the failure path because
          // some browsers refuse clipboard writes outside trusted handlers.
          try {
            await navigator.clipboard.writeText(url)
            toast.success("Novo link copiado", { description: url })
          } catch {
            toast.success("Checkout reaberto", { description: url })
          }
          setResendOpen(false)
        },
        onError: () => toast.error("Falha ao reenviar checkout"),
      },
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Mais ações">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={print}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </DropdownMenuItem>
          {canResend && (
            <DropdownMenuItem onSelect={() => setResendOpen(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Reenviar checkout
            </DropdownMenuItem>
          )}
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

      <AlertDialog open={resendOpen} onOpenChange={setResendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reenviar checkout?</AlertDialogTitle>
            <AlertDialogDescription>
              Vamos gerar um novo prazo para o cliente concluir o pagamento.
              O link público será copiado para sua área de transferência —
              cole onde quiser (WhatsApp, Instagram, e-mail).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResendConfirm}
              disabled={regenerate.isPending}
            >
              {regenerate.isPending ? "Gerando…" : "Gerar e copiar link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
