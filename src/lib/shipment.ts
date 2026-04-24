import type { ShipmentStatus, ShipmentStatusBucket } from "@/types"

// Coarse bucket used to pick badge color / icon. Same bucket for any provider.
export function shipmentStatusBucket(
  status: ShipmentStatus
): ShipmentStatusBucket {
  switch (status) {
    case "awaiting_invoice":
    case "pending":
    case "pending_pickup":
    case "pending_dropoff":
    case "awaiting_pickup":
      return "awaiting"
    case "in_transit":
    case "out_for_delivery":
      return "in_transit"
    case "delivered":
      return "delivered"
    case "returning":
    case "returned":
      return "returning"
    case "canceled":
      return "canceled"
    case "delivery_issue":
    case "delivery_blocked":
    case "issue":
    case "shipment_blocked":
    case "damaged":
    case "stolen":
    case "lost":
    case "fiscal_issue":
    case "refused":
    case "not_delivered":
    case "indemnification_requested":
    case "indemnification_scheduled":
    case "indemnification_completed":
      return "issue"
    case "unknown":
    default:
      return "awaiting"
  }
}

export const SHIPMENT_BUCKET_LABEL: Record<ShipmentStatusBucket, string> = {
  awaiting: "Aguardando",
  in_transit: "Em trânsito",
  delivered: "Entregue",
  issue: "Problema",
  returning: "Devolução",
  canceled: "Cancelado",
}

const STATUS_LABEL: Partial<Record<ShipmentStatus, string>> = {
  awaiting_invoice: "Aguardando NFe",
  pending: "Pedido em aberto",
  pending_pickup: "Aguardando coleta",
  pending_dropoff: "Aguardando postagem",
  awaiting_pickup: "Aguardando coleta",
  in_transit: "Em trânsito",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  delivery_issue: "Problema na entrega",
  delivery_blocked: "Entrega bloqueada",
  issue: "Problema",
  shipment_blocked: "Envio bloqueado",
  damaged: "Danificado",
  stolen: "Roubado",
  lost: "Extraviado",
  fiscal_issue: "Problema fiscal",
  refused: "Recusado",
  not_delivered: "Não entregue",
  indemnification_requested: "Indenização solicitada",
  indemnification_scheduled: "Indenização agendada",
  indemnification_completed: "Indenização concluída",
  returning: "Em devolução",
  returned: "Devolvido",
  canceled: "Cancelado",
  unknown: "Status desconhecido",
}

export function shipmentStatusLabel(status: ShipmentStatus): string {
  return STATUS_LABEL[status] ?? status
}
