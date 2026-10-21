import { expect, test } from "@playwright/test"
import { getCheckoutErrorMessage, getCheckoutLoadError } from "../src/lib/checkout-errors"
import { orderWorkflow } from "../src/components/order/OrderDetail/order-workflow"
import type { OrderDetail } from "../src/types"

test("CART_MERGED classifica pela razão e orienta pedir link à loja", () => {
  const error = { status: 422, reason: "CART_MERGED", error: "mensagem genérica" }
  const result = getCheckoutLoadError(error)
  expect(result).toMatchObject({ title: "Carrinho incorporado ao VIP", canRetry: false, showBrowserHelp: false })
  expect(result.message).toContain("Fale com a loja para receber o link do carrinho VIP")
  expect(result.message).not.toMatch(/expirad|cancelado pela loja|https?:/i)
  expect(getCheckoutErrorMessage(error)).toBe(result.message)
})

test("expiração, cancelamento legado e falha temporária mantêm suas mensagens", () => {
  expect(getCheckoutLoadError({ status: 422, reason: "CART_EXPIRED" })).toMatchObject({ title: "Carrinho expirado", canRetry: false })
  expect(getCheckoutLoadError({ status: 422, error: "Cancelado pela loja" }).message).toBe("Cancelado pela loja")
  expect(getCheckoutLoadError({ status: 503, error: "Indisponível" })).toMatchObject({ message: "Indisponível", canRetry: true })
})

for (const [paidCents, orderTotalCents] of [[17040, 37150], [32340, 35480]]) {
  test(`pedido pago ${paidCents}: revisão tem prioridade sem alterar valores`, () => {
    const order = {
      status: "checkout", paymentStatus: "paid", paidTotalCents: paidCents,
      erpFinalisation: { status: "done", attemptsCount: 1, canRetry: false },
      erpPaymentReview: { externalOrderId: "erp", reason: "installments_unverified", paidCents, orderTotalCents, detectedAt: "2026-10-12T12:00:00Z", checkedAt: "2026-10-21T12:00:00Z" },
    } as OrderDetail
    const before = structuredClone(order)
    const workflow = orderWorkflow(order)
    expect(workflow.steps[0].state).toBe("attention")
    expect(workflow.next.target).toBe("order-payment")
    expect(order).toEqual(before)
  })
}
