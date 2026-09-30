import type { PublicCheckoutCart } from "../../../src/types/cart.types"
import type { PublicCatalog } from "../../../src/services/api/public-catalog.service"

export const cart: PublicCheckoutCart = {
  id: "cart", token: "stock-edit", status: "checkout", paymentStatus: "pending",
  customerEmail: null, paidAt: null, checkoutUrl: null, platformHandle: "buyer",
  allowEdit: true, maxQuantityPerItem: 10, expiresAt: null, createdAt: "2026-09-01T10:00:00Z",
  event: { id: "event", title: "Evento de teste", freeShipping: false, pixDiscountPercent: 0 },
  store: { id: "store", name: "Loja de teste", logoUrl: null },
  items: [{ id: "item", productId: "product", name: "Bola de teste", imageUrl: null, keyword: "2645", quantity: 2, unitPrice: 1000, totalPrice: 2000, waitlistedQuantity: 0, availableStock: 8 }],
  waitlistItems: [],
  summary: { subtotal: 2000, shippingCost: 0, couponDiscount: 0, pixDiscountPercent: 0, pixDiscountCents: 0, total: 2000, totalItems: 2, hasShippingQuote: false },
}
export const catalog: PublicCatalog = {
  id: "catalog", name: "Catálogo de teste", products: [{ id: "product", name: "Bola de teste", code: "2645", price: 1000, imageUrl: "", stock: 8, position: 1 }],
}
