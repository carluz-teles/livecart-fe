import type { CartItemPriceLot } from "@/types/cart.types"

interface PricedItem {
  quantity: number
  waitlistedQuantity?: number
  unitPrice: number
  priceLots?: CartItemPriceLot[]
}

/** Respostas anteriores aos lotes continuam usando o preço único do item. */
export function getItemPriceLots(item: PricedItem): CartItemPriceLot[] {
  if (item.priceLots?.length) return item.priceLots
  const waitlistedQuantity = item.waitlistedQuantity ?? 0
  return [{
    quantity: item.quantity,
    waitlistedQuantity,
    unitPrice: item.unitPrice,
    totalPrice: Math.max(item.quantity - waitlistedQuantity, 0) * item.unitPrice,
  }]
}

/** Agrupa apenas preços iguais; nenhuma média substitui o preço da solicitação. */
export function getAvailablePriceLots(item: PricedItem) {
  const byPrice = new Map<number, { quantity: number; unitPrice: number; totalPrice: number }>()
  for (const lot of getItemPriceLots(item)) {
    const quantity = Math.max(lot.quantity - lot.waitlistedQuantity, 0)
    if (quantity === 0) continue
    const previous = byPrice.get(lot.unitPrice)
    byPrice.set(lot.unitPrice, {
      quantity: quantity + (previous?.quantity ?? 0),
      unitPrice: lot.unitPrice,
      totalPrice: lot.totalPrice + (previous?.totalPrice ?? 0),
    })
  }
  return Array.from(byPrice.values())
}

export function getPayableItemTotal(item: PricedItem): number {
  return getAvailablePriceLots(item).reduce((total, lot) => total + lot.totalPrice, 0)
}
