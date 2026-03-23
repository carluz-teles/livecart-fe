export type CartStatus = "open" | "checkout" | "completed" | "expired"

export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage: string | null
  size: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: string
  token: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  status: CartStatus
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface CartCheckoutPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}
