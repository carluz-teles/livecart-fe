import { apiClient } from "./client"
import type {
  IntegrationProvider,
  ShippingCarrier,
  CreateShipmentPayload,
  Shipment,
  AttachInvoicePayload,
  GenerateLabelsPayload,
  GenerateLabelsResponse,
  TrackingLookupPayload,
  TrackingResponse,
} from "@/types"

// Shipping admin endpoints (post-integration operations).
// All routes live under /stores/:storeId/integrations/shipping/:provider/...
export const shippingService = {
  // List carrier services the shipping embarcador has enabled.
  listCarriers: (
    storeId: string,
    provider: IntegrationProvider,
    token?: string | null
  ) =>
    apiClient.get<ShippingCarrier[]>(
      `/stores/${storeId}/integrations/shipping/${provider}/carriers`,
      token
    ),

  createShipment: (
    storeId: string,
    provider: IntegrationProvider,
    payload: CreateShipmentPayload,
    token?: string | null
  ) =>
    apiClient.post<Shipment>(
      `/stores/${storeId}/integrations/shipping/${provider}/shipments`,
      payload,
      token
    ),

  attachInvoice: (
    storeId: string,
    provider: IntegrationProvider,
    shipmentId: string,
    payload: AttachInvoicePayload,
    token?: string | null
  ) =>
    apiClient.post<Shipment>(
      `/stores/${storeId}/integrations/shipping/${provider}/shipments/${shipmentId}/invoice`,
      { invoiceKind: "nfe", ...payload },
      token
    ),

  uploadInvoiceXml: (
    storeId: string,
    provider: IntegrationProvider,
    shipmentId: string,
    file: File,
    token?: string | null
  ) => {
    const form = new FormData()
    form.append("file", file)
    return apiClient.postMultipart<Shipment>(
      `/stores/${storeId}/integrations/shipping/${provider}/shipments/${shipmentId}/invoice-xml`,
      form,
      token
    )
  },

  generateLabels: (
    storeId: string,
    provider: IntegrationProvider,
    payload: GenerateLabelsPayload,
    token?: string | null
  ) =>
    apiClient.post<GenerateLabelsResponse>(
      `/stores/${storeId}/integrations/shipping/${provider}/labels`,
      payload,
      token
    ),

  // Pulls tracking on demand — accepts exactly ONE identifier. Caller should
  // prefer providerOrderId when available; the others are fallbacks for cases
  // where the provider id wasn't persisted.
  getTracking: (
    storeId: string,
    provider: IntegrationProvider,
    payload: TrackingLookupPayload,
    token?: string | null
  ) =>
    apiClient.post<TrackingResponse>(
      `/stores/${storeId}/integrations/shipping/${provider}/tracking`,
      payload,
      token
    ),
}
