import { defaultShippingProfile } from "@/schemas/product.schema"
import type { CreateProductFormData, UpdateProductFormData } from "@/schemas/product.schema"
import type { ERPProduct } from "@/types/integration.types"
import type { CreateProductPayload, Product, ProductSource, UpdateProductPayload } from "@/types/product.types"

export function productFormFromERP(product: ERPProduct, source: ProductSource): CreateProductFormData {
  return {
    name: product.name,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl || "",
    externalSource: source,
    externalId: product.id,
    shipping: {
      ...defaultShippingProfile,
      ...product.shipping,
      sku: product.sku ?? "",
      barcode: product.gtin,
    },
  }
}

export function createProductPayload(data: CreateProductFormData): CreateProductPayload {
  return {
    name: data.name,
    price: data.price,
    stock: data.stock,
    imageUrl: data.imageUrl || undefined,
    externalSource: data.externalSource,
    externalId: data.externalId || undefined,
    // Identifiers do not require dimensions. Explicit null dimensions are also
    // needed when a merchant intentionally clears an existing shipping profile.
    shipping: data.shipping,
  }
}

export function updateProductPayload(data: UpdateProductFormData, original: Product): UpdateProductPayload {
  return {
    name: data.name,
    price: data.price,
    stock: data.stock,
    active: data.active,
    imageUrl: data.imageUrl ?? "",
    shipping: {
      ...data.shipping,
      // A form opened before a SYNC must not undo newly filled identifiers
      // when the merchant only changes the name, price or dimensions.
      sku: data.shipping.sku === original.shipping.sku ? undefined : data.shipping.sku,
      barcode: data.shipping.barcode === original.shipping.barcode ? undefined : data.shipping.barcode,
    },
  }
}
