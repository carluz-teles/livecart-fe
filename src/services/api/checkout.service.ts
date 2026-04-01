import { apiClient } from "./client"
import type {
  PublicCheckoutCart,
  GenerateCheckoutRequest,
  GenerateCheckoutResponse,
} from "@/types"

/**
 * Service for public checkout API (no authentication required)
 */
export const checkoutService = {
  /**
   * Get cart details for public checkout page
   */
  getCart: (token: string) =>
    apiClient.publicGet<PublicCheckoutCart>(`/api/public/checkout/${token}`),

  /**
   * Generate payment link for the cart
   */
  generateCheckout: (token: string, data: GenerateCheckoutRequest) =>
    apiClient.publicPost<GenerateCheckoutResponse>(
      `/api/public/checkout/${token}`,
      data
    ),
}
