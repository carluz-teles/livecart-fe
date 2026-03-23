import { apiClient } from "./client"
import type { Cart, CartCheckoutPayload } from "@/types"

export const cartService = {
  getByToken: (token: string) => apiClient.get<Cart>(`/carts/${token}`),

  checkout: (token: string, payload: CartCheckoutPayload) =>
    apiClient.post<Cart>(`/carts/${token}/checkout`, payload),

  removeItem: (token: string, itemId: string) =>
    apiClient.delete<Cart>(`/carts/${token}/items/${itemId}`),

  updateItemQuantity: (token: string, itemId: string, quantity: number) =>
    apiClient.patch<Cart>(`/carts/${token}/items/${itemId}`, { quantity }),
}
