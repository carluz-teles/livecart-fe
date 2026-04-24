import { apiClient } from "./client"
import type { IntegrationProvider, ShippingCarrier } from "@/types"

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
}
