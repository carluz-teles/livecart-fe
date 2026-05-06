"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

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
import { useConfirmDelivery } from "@/hooks/order-tracking/usePublicOrder"

interface OrderTrackingConfirmDeliveryProps {
  shortId: string
  trackingKey: string
}

// Customer-facing "Recebi!" call-to-action shown when status=shipped. We use a
// confirmation dialog so a misclick doesn't silently terminate the order
// timeline — once confirmed, the BE marks the cart as delivered and the
// merchant has to manually revert if the customer changes their mind.
export function OrderTrackingConfirmDelivery({
  shortId,
  trackingKey,
}: OrderTrackingConfirmDeliveryProps) {
  const [open, setOpen] = useState(false)
  const mutation = useConfirmDelivery({ shortId, trackingKey })

  const onConfirm = () => {
    mutation.mutate(undefined, {
      onSettled: () => setOpen(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
        className="w-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
      >
        <CheckCircle2 className="mr-2 h-5 w-5" />
        Recebi meu pedido
      </Button>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar entrega?</AlertDialogTitle>
          <AlertDialogDescription>
            Vamos marcar este pedido como entregue. Se você ainda não recebeu,
            cancele e fale com a loja antes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-emerald-500 hover:bg-emerald-600"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Sim, recebi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
