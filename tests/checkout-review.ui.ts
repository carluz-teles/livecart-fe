import { expect, test } from "@playwright/test"

test("link incorporado ao VIP explica motivo sem destino inventado", async ({ page }) => {
  await page.goto("/cart/merged-vip")
  await expect(page.getByRole("heading", { name: "Carrinho incorporado ao VIP" })).toBeVisible()
  await expect(page.getByText(/Fale com a loja para receber o link do carrinho VIP/)).toBeVisible()
  await expect(page.getByText(/expirado|cancelado pela loja|abrir no navegador/i)).toHaveCount(0)
  await expect(page.getByRole("link")).toHaveCount(0)
  await expect(page).toHaveURL(/\/cart\/merged-vip$/)
})

test("cancelamento pela loja e prazo expirado continuam distintos", async ({ page }) => {
  await page.goto("/cart/store-cancelled")
  await expect(page.getByText(/cancelado pela loja/)).toBeVisible()
  await expect(page.getByText(/incorporado|expirado/i)).toHaveCount(0)
  await page.goto("/cart/expired-domain")
  await expect(page.getByRole("heading", { name: "Carrinho expirado" })).toBeVisible()
})

test("refetch do checkout ativo classifica a incorporação como o servidor", async ({ page }) => {
  await page.route("**/api/public/checkout/refetch-merged", route => route.fulfill({
    status: 422, json: { reason: "CART_MERGED", error: "mensagem genérica" },
  }))
  await page.goto("/payment-review")
  await page.getByRole("button", { name: "Abrir checkout ativo" }).click()
  await expect(page.getByRole("heading", { name: "Loja de teste" })).toBeVisible()
  await page.getByRole("button", { name: "Atualizar checkout" }).click()
  await expect(page.getByRole("heading", { name: "Carrinho incorporado ao VIP" })).toBeVisible()
  await expect(page.getByText(/Fale com a loja para receber o link do carrinho VIP/)).toBeVisible()
  await expect(page.getByRole("link", { name: "Tentar novamente" })).toHaveCount(0)
})

for (const [id, paid, total, difference] of [
  [1210, "170,40", "371,50", "201,10"],
  [1237, "323,40", "354,80", "31,40"],
] as const) {
  test(`pedido ${id} pago exibe saldo em conferência sem nova cobrança`, async ({ page }) => {
    const mutations: string[] = []
    page.on("request", request => {
      if (request.url().includes("/api/") && request.method() !== "GET") mutations.push(request.url())
    })
    await page.goto("/payment-review")
    await page.getByRole("button", { name: `Pedido ${id}` }).click()
    await page.getByRole("link", { name: "Conferir pagamento", exact: true }).click()
    await expect(page).toHaveURL(/#order-payment$/)
    const note = page.getByRole("note", { name: "Revisão financeira" })
    await expect(note).toBeVisible()
    await expect(note).toContainText("O status pago está preservado")
    for (const value of [paid, total, difference]) await expect(note).toContainText(value)
    await expect(note).toContainText("Saldo pendente de conferência")
    await expect(note).toContainText("Esta diferença não confirma uma dívida")
    const payment = page.locator("#order-payment")
    await expect(payment.getByText("Pago", { exact: true })).toBeVisible()
    await expect(payment.locator("div").filter({ has: page.locator("dt", { hasText: "Valor pago" }) }).last()).toContainText(paid)
    await expect(payment.getByRole("button")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Reabrir checkout|Cobrar|Gerar PIX|Estornar|Tentar novamente/ })).toHaveCount(0)
    expect(mutations).toEqual([])
  })
}

test("revisão sem valores, valores iguais e total menor não inventam saldo; conciliação remove aviso", async ({ page }) => {
  await page.goto("/payment-review")
  const note = page.getByRole("note", { name: "Revisão financeira" })
  await page.getByRole("button", { name: "Valores não verificados" }).click()
  await expect(note).toBeVisible()
  await expect(note).not.toContainText(/R\$|Saldo pendente|NaN/)
  await page.getByRole("button", { name: "Valores iguais" }).click()
  await expect(note).not.toContainText("Saldo pendente")
  await page.getByRole("button", { name: "Total menor" }).click()
  await expect(note).toContainText("Pago acima do total observado")
  await expect(note).toContainText("10,00")
  await expect(note).not.toContainText("Saldo pendente")
  await page.getByRole("button", { name: "Conciliação confirmada" }).click()
  await expect(note).toHaveCount(0)
  await expect(page.getByText(/Conciliação financeira pendente/)).toHaveCount(0)
  await expect(page.getByText("Pago", { exact: true })).toBeVisible()
})
