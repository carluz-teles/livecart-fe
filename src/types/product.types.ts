export interface Product {
  id: string
  name: string
  keyword: string
  externalId: string | null
  externalSource: "bling" | "tiny" | "shopify" | "manual"
  price: number
  imageUrl: string | null
  sizes: string[]
  stock: number
  active: boolean
  updatedAt: string
}

export interface CreateProductPayload {
  name: string
  externalId?: string
  externalSource: Product["externalSource"]
  keyword: string
  price: number
  imageUrl?: string
  sizes: string[]
  stock: number
}
