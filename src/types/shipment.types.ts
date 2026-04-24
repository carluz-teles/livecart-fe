// Normalized shipment status — same enum across all providers. Backend
// translates provider-specific codes into these values.
export type ShipmentStatus =
  | "unknown"
  | "awaiting_invoice"
  | "pending"
  | "pending_pickup"
  | "pending_dropoff"
  | "awaiting_pickup"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "delivery_issue"
  | "delivery_blocked"
  | "issue"
  | "shipment_blocked"
  | "damaged"
  | "stolen"
  | "lost"
  | "fiscal_issue"
  | "refused"
  | "not_delivered"
  | "indemnification_requested"
  | "indemnification_scheduled"
  | "indemnification_completed"
  | "returning"
  | "returned"
  | "canceled"

// 6 buckets used for coarse UX grouping (badge color, icon, etc.).
export type ShipmentStatusBucket =
  | "awaiting"
  | "in_transit"
  | "delivered"
  | "issue"
  | "returning"
  | "canceled"

export interface ShipmentAddress {
  name: string
  document: string
  zipCode: string
  street: string
  number: string
  neighborhood: string
  complement?: string
  phone?: string
  email?: string
  observation?: string
}

export interface ShipmentItemPayload {
  id: string
  name: string
  quantity: number
  unitPriceCents: number
  weightGrams: number
  heightCm: number
  widthCm: number
  lengthCm: number
}

export interface CreateShipmentPayload {
  quoteServiceId: string
  externalOrderId: string
  invoiceKey?: string
  sender: ShipmentAddress
  destiny: Omit<ShipmentAddress, "observation">
  items: ShipmentItemPayload[]
  volumeCount: number
  observation?: string
}

export interface Shipment {
  providerOrderId: string
  providerOrderNumber: string
  trackingCode: string
  invoiceId?: string
  status: ShipmentStatus
  statusRawCode?: number
  statusRawName?: string
  publicTrackingUrl?: string
  createdAt: string
}

export interface AttachInvoicePayload {
  invoiceKey: string
  invoiceKind?: "nfe"
}

export type LabelFormat = "pdf" | "zpl" | "base64"
export type LabelDocumentType = "label_integrated_danfe" | "label_separate_danfe"

export interface GenerateLabelsPayload {
  providerOrderIds?: string[]
  trackingCodes?: string[]
  invoiceKeys?: string[]
  externalOrderIds?: string[]
  format: LabelFormat
  documentType: LabelDocumentType
}

export interface LabelTicket {
  providerOrderId: string
  trackingCode: string
  publicTracking?: string
  volumeBarcodes?: string[]
}

export interface GenerateLabelsResponse {
  labelUrl: string
  tickets: LabelTicket[]
}

// POST /tracking accepts exactly ONE of these — providerOrderId is preferred.
export interface TrackingLookupPayload {
  providerOrderId?: string
  externalOrderId?: string
  invoiceKey?: string
  trackingCode?: string
}

export interface TrackingEvent {
  status: ShipmentStatus
  rawCode?: number
  rawName?: string
  observation?: string
  eventAt: string
}

export interface TrackingResponse {
  trackingCode: string
  carrier: string
  service: string
  currentStatus: ShipmentStatus
  events: TrackingEvent[]
}
