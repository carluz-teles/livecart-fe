import { expect, test } from "@playwright/test"
import { createEventSchema, updateEventWindowSchema } from "../src/schemas/event.schema"
import { getAvailablePriceLots, getPayableItemTotal } from "../src/lib/cart-item-prices"
import { groupOrderItemsByProduct } from "../src/lib/order-items"
import type { OrderItem } from "../src/types/cart.types"

const event = { title: "Reposição", endsAt: "2026-09-22T18:00:00Z" }

for (const [name, schema] of [["criação", createEventSchema], ["edição", updateEventWindowSchema]] as const) {
  test(`${name}: Y aceita zero, minutos, horas e o teto de 30 dias`, () => {
    for (const minutes of [0, 1, 59, 60, 240, 1440, 43200]) {
      expect(schema.parse({ ...event, waitlistNotifiedTtlMinutes: minutes }).waitlistNotifiedTtlMinutes).toBe(minutes)
    }
  })

  test(`${name}: Y rejeita negativo, fração e acima de 30 dias`, () => {
    for (const minutes of [-1, 0.5, 43201]) {
      expect(schema.safeParse({ ...event, waitlistNotifiedTtlMinutes: minutes }).success).toBe(false)
    }
  })
}

const mixedItem = {
  quantity: 5,
  waitlistedQuantity: 2,
  unitPrice: 9999,
  priceLots: [
    { quantity: 3, waitlistedQuantity: 2, unitPrice: 1001, totalPrice: 1001 },
    { quantity: 2, waitlistedQuantity: 0, unitPrice: 2002, totalPrice: 4004 },
  ],
}

test("promoção parcial cobra somente disponíveis pelo preço de cada solicitação", () => {
  expect(getAvailablePriceLots(mixedItem)).toEqual([
    { quantity: 1, unitPrice: 1001, totalPrice: 1001 },
    { quantity: 2, unitPrice: 2002, totalPrice: 4004 },
  ])
  expect(getPayableItemTotal(mixedItem)).toBe(5005)
})

test("nenhum lote disponível não volta ao preço legado", () => {
  expect(getPayableItemTotal({ ...mixedItem, priceLots: [
    { quantity: 3, waitlistedQuantity: 3, unitPrice: 1001, totalPrice: 0 },
  ] })).toBe(0)
})

test("resposta sem lotes mantém compatibilidade excluindo a espera", () => {
  expect(getPayableItemTotal({ quantity: 3, waitlistedQuantity: 2, unitPrice: 1001 })).toBe(1001)
  expect(getPayableItemTotal({ quantity: 3, waitlistedQuantity: 2, unitPrice: 1001, priceLots: [] })).toBe(1001)
})

test("detalhe e impressão agrupam sessões sem perder seus preços nem alterar a origem", () => {
  const items = [
    { ...mixedItem, id: "first", productId: "p1", totalPrice: 5005, size: null },
    { id: "second", productId: "p1", quantity: 1, waitlistedQuantity: 0, unitPrice: 777, totalPrice: 777, size: null },
  ] as OrderItem[]
  const original = structuredClone(items)
  const grouped = groupOrderItemsByProduct(items)
  expect(grouped).toHaveLength(1)
  expect(grouped[0].quantity).toBe(6)
  expect(grouped[0].waitlistedQuantity).toBe(2)
  expect(getPayableItemTotal(grouped[0])).toBe(5782)
  expect(getAvailablePriceLots(grouped[0]).map((lot) => lot.unitPrice)).toEqual([1001, 2002, 777])
  expect(items).toEqual(original)
})
