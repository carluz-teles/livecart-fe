import { expect, test } from "@playwright/test"
import { QueryClient } from "@tanstack/react-query"
import { orderService } from "../src/services/api/order.service"
import { orderWorkflow } from "../src/components/order/OrderDetail/order-workflow"
import { refreshProductsAfterResync } from "../src/hooks/integration/resync-cache"
import { productKeys } from "../src/hooks/product/useProducts"
import type { OrderDetail, IntegrationListResponse } from "../src/types"

const order = (changes: Partial<OrderDetail> = {}) =>
  ({
    status: "active",
    paymentStatus: "paid",
    erpFinalisation: null,
    erpInvoice: null,
    shipment: null,
    ...changes,
  }) as OrderDetail

test("pagamento em conferência tem prioridade sobre entrega e ERP", () => {
  const result = orderWorkflow(
    order({
      paymentReviewRequired: true,
      erpFinalisation: { status: "done", attemptsCount: 1, canRetry: false },
    }),
  )
  expect(result.steps[0].detail).toBe("Em conferência")
  expect(result.next.target).toBe("order-payment")
})

test("ausência de confirmação no ERP não vira aprovação", () => {
  const result = orderWorkflow(order())
  expect(result.steps[1]).toMatchObject({
    state: "unknown",
    detail: "Sem confirmação",
  })
})

test("falha na aprovação e itens pendentes levam à pendência no ERP", () => {
  for (const changes of [
    {
      erpFinalisation: {
        status: "failed" as const,
        attemptsCount: 1,
        canRetry: true,
      },
    },
    { erpPendingItems: 2 },
  ]) {
    expect(orderWorkflow(order(changes)).next.target).toBe("order-erp")
  }
})

test("nota autorizada sem chave continua pendente", () => {
  const result = orderWorkflow(order({ erpInvoice: { status: "authorized" } }))
  expect(result.steps[2].state).toBe("waiting")
  expect(result.next.label).toBe("Conferir nota fiscal")
})

test("pedido estornado ou encerrado não recomenda envio", () => {
  for (const changes of [
    { paymentStatus: "refunded" as const },
    { status: "expired" as const, paymentStatus: "pending" as const },
    { status: "cancelled" as const, paymentStatus: "pending" as const },
  ]) {
    expect(orderWorkflow(order(changes)).next.target).toBe("order-payment")
  }
})

test("problemas na entrega e entrega confirmada têm orientação própria", () => {
  const issue = orderWorkflow(
    order({ shipment: { status: "lost" } as OrderDetail["shipment"] }),
  )
  expect(issue.steps[3].state).toBe("attention")
  expect(issue.next.text).toContain("ocorrência")
  const delivered = orderWorkflow(
    order({ shipment: { status: "delivered" } as OrderDetail["shipment"] }),
  )
  expect(delivered.steps[3].state).toBe("done")
  expect(delivered.next.text).toContain("Entrega registrada")
})

const integrations = (running: boolean, id = "erp-1") =>
  ({ data: [{ id, erpResyncRunning: running }] }) as IntegrationListResponse

test("fim do SYNC invalida listas, detalhes e resumo somente da loja de origem", () => {
  const client = new QueryClient()
  const keys = [
    productKeys.list("a"),
    productKeys.list("a", { search: "flor" }),
    productKeys.detail("a", "product-1"),
    productKeys.stats("a"),
    productKeys.list("b"),
    productKeys.stats("b"),
  ]
  keys.forEach((key) => client.setQueryData(key, {}))
  refreshProductsAfterResync(
    client,
    "a",
    integrations(true),
    integrations(false),
  )
  expect(keys.map((key) => client.getQueryState(key)?.isInvalidated)).toEqual([
    true,
    true,
    true,
    true,
    false,
    false,
  ])
  client.clear()
})

test("progresso, primeira consulta e outra integração não invalidam produtos", () => {
  for (const [before, after] of [
    [integrations(true), integrations(true)],
    [undefined, integrations(false)],
    [integrations(true), integrations(false, "erp-2")],
  ] as const) {
    const client = new QueryClient()
    client.setQueryData(productKeys.list("a"), {})
    refreshProductsAfterResync(client, "a", before, after)
    expect(client.getQueryState(productKeys.list("a"))?.isInvalidated).toBe(
      false,
    )
    client.clear()
  }
})

test("edição persistida ainda aguarda sincronização mesmo sem itens na grade", () => {
  const result = orderWorkflow(order({
    paymentStatus: "pending",
    erpPendingItems: 0,
    erpItemSync: { pending: true, processing: true, attempts: 1 },
  }))
  expect(result.steps[1]).toMatchObject({ state: "waiting", detail: "Sincronizando itens" })
  expect(result.next.target).toBe("order-erp")
  expect(result.next.text).toContain("Aguarde a sincronização")
})

test("falha de sincronização aparece como pendência e pagamento em conferência tem prioridade", () => {
  const pending = { pending: true, processing: false, attempts: 2, lastError: "ERP indisponível" }
  expect(orderWorkflow(order({ erpItemSync: pending })).steps[1].state).toBe("attention")
  expect(orderWorkflow(order({ erpItemSync: pending, paymentReviewRequired: true })).next.target).toBe("order-payment")
})

test("edições enviam a mesma chave fornecida pelo chamador em adição, quantidade e remoção", async () => {
  const originalFetch = globalThis.fetch
  const calls: { method: string; headers: Headers; body: string | undefined }[] = []
  globalThis.fetch = async (_url, init) => {
    calls.push({ method: init!.method!, headers: new Headers(init!.headers), body: init?.body as string | undefined })
    return new Response(JSON.stringify({ data: { id: "order", erpItemSync: { pending: true } } }), {
      status: 200, headers: { "Content-Type": "application/json" },
    })
  }
  const key = "56854638-d61f-4574-9c24-7e9f2a9b97ad"
  try {
    await orderService.addItem("store", "order", { productId: "product", quantity: 2 }, "token", key)
    await orderService.setItemQuantity("store", "order", "item", 3, "token", key)
    await orderService.removeItem("store", "order", "item", "token", key)
    expect(calls.map((call) => call.method)).toEqual(["POST", "PATCH", "DELETE"])
    expect(calls.map((call) => call.headers.get("Idempotency-Key"))).toEqual([key, key, key])
    expect(calls.every((call) => call.headers.get("Authorization") === "Bearer token")).toBe(true)
    expect(JSON.parse(calls[0].body!)).toEqual({ productId: "product", quantity: 2 })
    expect(JSON.parse(calls[1].body!)).toEqual({ quantity: 3 })
    expect(calls[2].body).toBeUndefined()
  } finally {
    globalThis.fetch = originalFetch
  }
})
