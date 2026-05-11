import { apiClient } from "./client"
import type {
  ApplyCouponResponse,
  PublicCheckoutCart,
  GenerateCheckoutRequest,
  GenerateCheckoutResponse,
  CheckoutConfigResponse,
  ProcessCardPaymentRequest,
  ProcessCardPaymentResponse,
  GeneratePixRequest,
  GeneratePixResponse,
  PaymentStatusResponse,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
  SelectShippingMethodRequest,
  SelectShippingMethodResponse,
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

  // ==========================================================================
  // SHIPPING (Melhor Envio)
  // ==========================================================================

  /**
   * Request shipping quote for a CEP
   */
  quoteShipping: (token: string, data: ShippingQuoteRequest) =>
    apiClient.publicPost<ShippingQuoteResponse>(
      `/api/public/checkout/${token}/shipping-quote`,
      data
    ),

  /**
   * Persist selected shipping method for the cart
   */
  selectShippingMethod: (token: string, data: SelectShippingMethodRequest) =>
    apiClient.publicPut<SelectShippingMethodResponse>(
      `/api/public/checkout/${token}/shipping-method`,
      data
    ),

  // ==========================================================================
  // CART EDITS (buyer-driven mutations at checkout)
  // All three return the freshly-loaded PublicCheckoutCart so the React Query
  // cache can be swapped in one call.
  // ==========================================================================

  updateItemQuantity: (token: string, itemId: string, quantity: number) =>
    apiClient.publicPatch<PublicCheckoutCart>(
      `/api/public/checkout/${token}/items/${itemId}`,
      { quantity }
    ),

  removeItem: (token: string, itemId: string) =>
    apiClient.publicDelete<PublicCheckoutCart>(
      `/api/public/checkout/${token}/items/${itemId}`
    ),

  addItem: (token: string, productId: string, quantity: number) =>
    apiClient.publicPost<PublicCheckoutCart>(
      `/api/public/checkout/${token}/items`,
      { productId, quantity }
    ),

  // ==========================================================================
  // WAITLIST
  // ==========================================================================

  /**
   * Cliente desiste de uma entry da waitlist. Devolve o cart atualizado.
   * Se a entry estava 'notified', o backend libera o estoque para o
   * próximo da fila automaticamente.
   */
  dropFromWaitlist: (token: string, waitlistItemId: string) =>
    apiClient.publicDelete<PublicCheckoutCart>(
      `/api/public/checkout/${token}/waitlist/${waitlistItemId}`,
    ),

  // ==========================================================================
  // COUPONS
  // ==========================================================================

  applyCoupon: (token: string, code: string) =>
    apiClient.publicPost<ApplyCouponResponse>(
      `/api/public/checkout/${token}/coupon`,
      { code },
    ),

  removeCoupon: (token: string) =>
    apiClient.publicDelete<void>(`/api/public/checkout/${token}/coupon`),
}
