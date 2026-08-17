"use client"

import { use, useState } from "react"
import {
  Ban,
  BadgeDollarSign,
  CheckCircle2,
  Hash,
  Link2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
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
import { useConfirmManualPayment } from "@/hooks/order"
import type { ApiError } from "@/types/api.types"
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
  const [cancelOpen, setCancelOpen] = useState(false)
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false)
  const confirmManualPayment = useConfirmManualPayment()
  if (!ctx) return null
  const { order } = ctx.state
  const {
    refund,
    isRefunding,
    requestRegenerate,
    markDelivered,
    isMarkingDelivered,
    cancelOrder,
    isCancelling,
  } = ctx.actions

  // Cancelar só faz sentido enquanto o pedido está vivo e não pago. O backend
  // reforça isso com 409 (inclusive contra a corrida do pagamento) — esconder
  // a entrada só evita oferecer uma ação que já sabemos que será recusada.
  const canCancel =
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "refunded" &&
    order.status !== "cancelled" &&
    order.status !== "expired"

  // Show "Marcar como entregue" only when the order has been paid AND there
  // is a shipment, AND it hasn't already been marked delivered. The BE is
  // idempotent on order_events, so a misclick is harmless — but hiding the
  // entry keeps the menu honest.
  const canMarkDelivered =
    order.paymentStatus === "paid" &&
    !!order.shipment &&
    order.shipmentStatus !== "delivered"

  // Mesmo critério do backend, menos as corridas que só ele resolve: aqui é só
  // não oferecer o que já sabemos que será recusado.
  const canConfirmManualPayment =
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "refunded" &&
    order.status !== "cancelled" &&
    order.status !== "expired" &&
    order.items.length > 0

  const handleConfirmManualPayment = () => {
    setManualPaymentOpen(false)
    confirmManualPayment.mutate(
      { id: order.id },
      {
        onSuccess: () =>
          toast.success(`Pedido #${order.shortId} marcado como pago`, {
            description:
              "Enviado ao ERP com o estoque lançado. Registre o recebimento por lá.",
          }),
        onError: (error) => {
          const apiError = error as unknown as ApiError
          toast.error("Não foi possível confirmar o pagamento", {
            description: apiError?.message || apiError?.error,
          })
        },
      },
    )
  }

  const checkoutUrl = order.token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cart/${order.token}`
    : ""

  // Both link entries only make sense before payment / shipment — backend
  // returns 409 in those states anyway, but hiding the entries keeps the
  // menu honest about what's available.
  // Cancelado também some daqui: o link não aceita mais pagamento e o BE
  // recusa o regenerate (o estoque já voltou ao catálogo).
  const canShareLink =
    order.paymentStatus !== "paid" &&
    !order.shipment &&
    order.status !== "cancelled"

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

  const handleCancelConfirm = () => {
    cancelOrder()
    setCancelOpen(false)
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
          {/* Imprimir saiu daqui: virou botão visível no cabeçalho, porque para
              pedido não pago o documento é a tarefa principal (orçamento para a
              cliente), não uma ação secundária. Manter nos dois lugares daria
              dois caminhos para a mesma coisa. */}
          {/* Dinheiro que entrou por fora (Pix na maquininha, dinheiro,
              transferência). Só faz sentido enquanto o pedido não foi pago —
              depois de pago não há o que confirmar, e o backend recusa. */}
          {canConfirmManualPayment && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setManualPaymentOpen(true)}
                disabled={confirmManualPayment.isPending}
                className="text-emerald-700 focus:text-emerald-700"
              >
                <BadgeDollarSign className="mr-2 h-4 w-4" />
                Confirmar pagamento manual
              </DropdownMenuItem>
            </>
          )}
          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setCancelOpen(true)}
                disabled={isCancelling}
                className="text-destructive focus:text-destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancelar carrinho
              </DropdownMenuItem>
            </>
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

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este carrinho?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido #{order.shortId} passa a constar como{" "}
              <strong>cancelado</strong>: o estoque dos itens volta para o
              catálogo, a reserva no ERP é estornada e o link do cliente deixa de
              aceitar pagamento — ele verá que a loja cancelou, não que expirou.
              Se o cliente pagar exatamente neste instante, o pagamento vence e o
              pedido continua pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelando..." : "Cancelar carrinho"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={manualPaymentOpen} onOpenChange={setManualPaymentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar pagamento recebido por fora?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 leading-relaxed">
              <span className="block">
                O pedido #{order.shortId} passa a constar como{" "}
                <strong className="font-medium text-foreground">pago</strong> e
                segue o mesmo caminho de um pagamento pelo LiveCart: vira pedido
                de venda no seu ERP e o estoque é lançado.
              </span>
              <span className="block">
                O recebimento{" "}
                <strong className="font-medium text-foreground">
                  não é lançado no financeiro do ERP
                </strong>{" "}
                — registre por lá, com a forma como o dinheiro entrou.
              </span>
              <span className="block">
                Use só quando o dinheiro já entrou de verdade. Para desfazer,
                depois, seria preciso reembolsar.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmManualPayment.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmManualPayment}
              disabled={confirmManualPayment.isPending}
            >
              {confirmManualPayment.isPending
                ? "Confirmando..."
                : "Confirmar pagamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
