import type { OrderDetail } from "@/types/cart.types"
import { shipmentStatusBucket, shipmentStatusLabel } from "@/lib/shipment"

export type WorkflowState = "done" | "waiting" | "attention" | "unknown"
export interface WorkflowStep {
  title: string
  detail: string
  state: WorkflowState
}
export function orderWorkflow(order: OrderDetail) {
  const paid = order.paymentStatus === "paid"
  const finalisation = order.erpFinalisation?.status
  const invoice = order.erpInvoice
  const shipment = order.shipment
  const bucket = shipment ? shipmentStatusBucket(shipment.status) : null
  const invoiceReady = invoice?.status === "authorized" && !!invoice.invoiceKey
  const steps: WorkflowStep[] = [
    {
      title: "Pagamento",
      state: order.paymentReviewRequired
        ? "attention"
        : paid
          ? "done"
          : order.paymentStatus === "failed"
            ? "attention"
            : "waiting",
      detail: order.paymentReviewRequired
        ? "Em conferência"
        : paid
          ? "Recebido"
          : order.paymentStatus === "refunded"
            ? "Estornado"
            : order.paymentStatus === "cancelled"
              ? "Cancelado"
              : order.paymentStatus === "failed"
                ? "Falhou"
                : "Aguardando pagamento",
    },
    {
      title: "Aprovação no ERP",
      state: order.erpItemSync?.pending ? (order.erpItemSync.lastError ? "attention" : "waiting") :
        (order.erpPendingItems ?? 0) > 0 || finalisation === "failed"
          ? "attention"
          : finalisation === "done"
            ? "done"
            : finalisation === "pending"
              ? "waiting"
              : "unknown",
      detail: order.erpItemSync?.pending ? "Sincronizando itens" :
        (order.erpPendingItems ?? 0) > 0
          ? `${order.erpPendingItems} itens pendentes`
          : finalisation === "done"
            ? "Aprovação concluída"
            : finalisation === "failed"
              ? "Falha na aprovação"
              : finalisation === "pending"
                ? "Pendente"
                : "Sem confirmação",
    },
    {
      title: "Nota fiscal",
      state: invoiceReady
        ? "done"
        : invoice?.status === "rejected" || invoice?.status === "cancelled"
          ? "attention"
          : "waiting",
      detail: invoiceReady
        ? "Autorizada"
        : invoice?.status === "authorized"
          ? "Chave pendente"
          : invoice?.status === "rejected"
            ? "Rejeitada"
            : invoice?.status === "cancelled"
              ? "Cancelada"
              : "Aguardando autorização",
    },
    {
      title: "Entrega",
      state:
        bucket === "delivered"
          ? "done"
          : bucket === "issue" ||
              bucket === "returning" ||
              bucket === "canceled"
            ? "attention"
            : "waiting",
      detail: shipment
        ? shipmentStatusLabel(shipment.status)
        : "Envio não criado",
    },
  ]
  let next = {
    text: "Confira os dados de entrega e prepare o envio.",
    target: "order-logistics",
    label: "Ver logística",
  }
  if (order.paymentReviewRequired)
    next = {
      text: "Confira a divergência de pagamento antes de liberar o pedido.",
      target: "order-payment",
      label: "Conferir pagamento",
    }
  else if (
    order.paymentStatus === "refunded" ||
    (!paid && (order.status === "cancelled" || order.status === "expired"))
  )
    next = {
      text: "Pedido encerrado. Consulte o pagamento e o histórico antes de qualquer nova ação.",
      target: "order-payment",
      label: "Ver pagamento",
    }
  else if (order.erpItemSync?.pending)
    next = {
      text: "As alterações estão salvas. Aguarde a sincronização antes de liberar o pagamento.",
      target: "order-erp",
      label: "Acompanhar sincronização",
    }
  else if (!paid)
    next = {
      text: "Acompanhe o pagamento e confira o link de checkout.",
      target: "order-payment",
      label: "Ver pagamento",
    }
  else if ((order.erpPendingItems ?? 0) > 0 || finalisation === "failed")
    next = {
      text: "Confira a pendência de sincronização no ERP antes de separar a mercadoria.",
      target: "order-erp",
      label: "Ver pendência no ERP",
    }
  else if (shipment)
    next = {
      text:
        bucket === "delivered"
          ? "Entrega registrada. Consulte o histórico do envio."
          : bucket === "issue" ||
              bucket === "returning" ||
              bucket === "canceled"
            ? "O envio precisa de atenção. Confira a ocorrência e o rastreamento."
            : "Acompanhe a etiqueta, a postagem e o rastreamento do envio.",
      target: "order-logistics",
      label: "Acompanhar envio",
    }
  else if (finalisation === "pending")
    next = {
      text: "A aprovação no ERP ainda está pendente. Acompanhe a atualização do pedido.",
      target: "order-history",
      label: "Ver histórico",
    }
  else if (!invoiceReady)
    next = {
      text: "Confira a nota fiscal no ERP e atualize sua situação na seção de logística.",
      target: "order-logistics",
      label: "Conferir nota fiscal",
    }
  return { steps, next }
}
