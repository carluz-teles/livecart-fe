import { apiClient } from "./client"
import type {
  PublicCheckoutCart,
  GenerateCheckoutRequest,
  GenerateCheckoutResponse,
  CheckoutConfigResponse,
  ProcessCardPaymentRequest,
  ProcessCardPaymentResponse,
  GeneratePixRequest,
  GeneratePixResponse,
  PaymentStatusResponse,
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
   * Generate payment link for the cart (legacy redirect flow)
   */
  generateCheckout: (token: string, data: GenerateCheckoutRequest) =>
    apiClient.publicPost<GenerateCheckoutResponse>(
      `/api/public/checkout/${token}`,
      data
    ),

  // ==========================================================================
  // TRANSPARENT CHECKOUT METHODS
  // ==========================================================================

  /**
   * Get checkout configuration (provider, public key, available methods)
   */
  getConfig: (token: string) =>
    apiClient.publicGet<CheckoutConfigResponse>(
      `/api/public/checkout/${token}/config`
    ),

  /**
   * Process card payment with tokenized card
   */
  processCardPayment: (token: string, data: ProcessCardPaymentRequest) =>
    apiClient.publicPost<ProcessCardPaymentResponse>(
      `/api/public/checkout/${token}/card`,
      data
    ),

  /**
   * Generate PIX QR code for payment
   */
  generatePix: (token: string, data: GeneratePixRequest) =>
    apiClient.publicPost<GeneratePixResponse>(
      `/api/public/checkout/${token}/pix`,
      data
    ),

  /**
   * Get current payment status (for polling)
   */
  getPaymentStatus: (token: string) =>
    apiClient.publicGet<PaymentStatusResponse>(
      `/api/public/checkout/${token}/status`
    ),
}
