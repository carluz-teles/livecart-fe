import { expect, test } from "@playwright/test"
import { QueryClient } from "@tanstack/react-query"
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
