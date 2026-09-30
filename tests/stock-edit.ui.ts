import { expect, test } from "@playwright/test"
import { cart } from "../test-fixtures/erp-import-ui/fixtures/cart-edit"

for (const action of [
  { label: "Adicionar", method: "POST" },
  { label: "Aumentar", method: "PATCH" },
  { label: "Remover", method: "DELETE" },
]) {
  test(`${action.method}: salva a chave, mostra pendência e aguarda confirmação`, async ({ page }) => {
    let accepted = false
    let confirmed = false
    const consoleErrors: string[] = []
    page.on("pageerror", (error) => consoleErrors.push(error.message))
    await page.route("**/api/public/checkout/stock-edit**", async (route) => {
      if (route.request().method() === action.method) accepted = true
      await route.fulfill({ json: { data: {
        ...cart,
        erpItemSync: { pending: accepted && !confirmed, processing: false, blocked: false, attempts: accepted ? 1 : 0 },
      } } })
    })
    await page.goto("/cart-edit")
    const sent = page.waitForRequest((request) => request.method() === action.method && request.url().includes("/items"))
    await page.getByRole("button", { name: action.label, exact: true }).click()
    const request = await sent
    expect(request.headers()["idempotency-key"]).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i)
    await expect(page.getByRole("status").filter({ hasText: "Alteração salva; aguardando confirmação" })).toBeVisible()
    for (const label of ["Adicionar", "Aumentar", "Diminuir", "Remover"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeDisabled()
    }
    await page.getByRole("button", { name: "Abrir checkout de teste" }).click()
    await expect(page.getByRole("heading", { name: "Confirmando as alterações do seu pedido" })).toBeVisible()
    confirmed = true
    await expect(page.getByRole("heading", { name: "Confirmando as alterações do seu pedido" })).toHaveCount(0)
    expect(consoleErrors).toEqual([])
  })
}

test("pendência bloqueada pede conferência sem prometer nova tentativa automática", async ({ page }) => {
  await page.route("**/api/public/checkout/stock-edit**", (route) => route.fulfill({ json: { data: {
    ...cart, erpItemSync: { pending: true, processing: false, blocked: true, attempts: 1 },
  } } }))
  await page.goto("/cart-edit")
  await page.getByRole("button", { name: "Adicionar", exact: true }).click()
  await expect(page.getByRole("status").filter({ hasText: "Seu pedido precisa de conferência" })).toBeVisible()
  await page.getByRole("button", { name: "Abrir checkout de teste" }).click()
  await expect(page.getByRole("heading", { name: "Seu pedido precisa de conferência" })).toBeVisible()
  await expect(page.getByText("Fale com a loja para conferir os itens deste pedido. O pagamento será liberado após a confirmação.")).toBeVisible()
})
