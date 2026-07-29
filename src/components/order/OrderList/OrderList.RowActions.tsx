"use client"

import { useState } from "react"
import Link from "next/link"
import { Ban, MoreHorizontal } from "lucide-react"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCancelOrder } from "@/hooks/order"
import type { Order } from "@/types/cart.types"
import type { ApiError } from "@/types/api.types"

interface OrderListRowActionsProps {
  order: Order
}

// Ações por linha da tabela de pedidos. Vive fora de OrderList.columns porque
// precisa de estado (dialog) e de mutation — a definição de coluna é só a
// descrição da célula.
export function OrderListRowActions({ order }: OrderListRowActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const cancelOrder = useCancelOrder()

  // Mesmo critério do detalhe: cancelar só enquanto o pedido está vivo e não
  // pago. O backend é quem garante (409), aqui é só não oferecer o impossível.
  const canCancel =
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "refunded" &&
    order.status !== "cancelled" &&
    order.status !== "expired"

  const handleCancel = () => {
    setCancelOpen(false)
    cancelOrder.mutate(
      { id: order.id },
      {
        onSuccess: () =>
          toast.success(`Pedido #${order.shortId} cancelado`, {
            description: "O estoque foi devolvido e o link não aceita mais pagamento.",
          }),
        onError: (error) => {
          const apiError = error as unknown as ApiError
          if (apiError?.status === 409) {
            toast.error("Não foi possível cancelar", {
              description: apiError.message || apiError.error,
            })
            return
          }
          toast.error("Falha ao cancelar o carrinho")
        },
      },
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/orders/${order.id}`}>Ver detalhes</Link>
          </DropdownMenuItem>
          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setCancelOpen(true)}
                disabled={cancelOrder.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancelar carrinho
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar o pedido #{order.shortId}?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido passa a constar como <strong>cancelado</strong>: o estoque
              volta para o catálogo, a reserva no ERP é estornada e o link do
              cliente deixa de aceitar pagamento — ele verá que a loja cancelou,
              não que expirou. Se o cliente pagar exatamente neste instante, o
              pagamento vence e o pedido continua pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelOrder.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelOrder.isPending ? "Cancelando..." : "Cancelar carrinho"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
