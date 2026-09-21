import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { data: { cartSettings: { expirationMinutes: 7200, maxQuantityPerItem: 10 } } } })
    } else {
      await route.fulfill({ json: { data: { id: "event-waitlist" } } })
    }
  })
  await page.goto("/waitlist")
})

test("edição preserva Y zero e envia 30 dias como 43200 minutos", async ({ page }) => {
  await page.getByRole("button", { name: "Editar evento de teste" }).click()
  const input = page.getByRole("spinbutton", { name: "Prazo extra para quem aguarda estoque", exact: true })
  await expect(input).toHaveValue("0")
  await page.getByRole("combobox", { name: "Prazo extra para quem aguarda estoque: unidade" }).click()
  await page.getByRole("option", { name: "dias", exact: true }).click()
  await input.fill("30")
  const saved = page.waitForRequest((request) => request.method() === "PUT")
  await page.getByRole("button", { name: "Salvar", exact: true }).click()
  expect((await saved).postDataJSON().waitlistNotifiedTtlMinutes).toBe(43200)
})

test("edição salva o adicional desativado sem voltar para 30 minutos", async ({ page }) => {
  await page.getByRole("button", { name: "Editar evento de teste" }).click()
  const saved = page.waitForRequest((request) => request.method() === "PUT")
  await page.getByRole("button", { name: "Salvar", exact: true }).click()
  expect((await saved).postDataJSON().waitlistNotifiedTtlMinutes).toBe(0)
})

test("criação envia Y zero sem substituí-lo pelo padrão", async ({ page }) => {
  await page.getByRole("button", { name: "Criar evento de teste" }).click()
  await page.getByPlaceholder("Ex: Semana Black").fill("Evento sem adicional")
  await page.getByRole("spinbutton", { name: "Prazo extra para quem aguarda estoque", exact: true }).fill("0")
  const saved = page.waitForRequest((request) => request.method() === "POST")
  await page.getByRole("button", { name: "Criar evento", exact: true }).click()
  expect((await saved).postDataJSON().waitlistNotifiedTtlMinutes).toBe(0)
})

test("checkout mostra preços por solicitação e promoção sem timer individual", async ({ page }) => {
  await expect(page.getByText("1 × R$ 10,01 + 2 × R$ 20,02")).toBeVisible()
  await expect(page.getByText("R$ 50,05", { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/Ao pagar os itens disponíveis, a espera restante é encerrada/)).toBeVisible()
  await expect(page.getByText(/sem prazo separado para este produto/)).toBeVisible()
  await expect(page.getByText(/Carrinho expirado|avisaremos no Instagram/)).toHaveCount(0)
})

test("produto com espera mantém as unidades disponíveis somente para leitura", async ({ page }) => {
  await expect(page.getByText("Para alterar a quantidade, encerre a espera deste produto primeiro.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Aumentar quantidade" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Diminuir quantidade" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Remover item", exact: true })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Sair da fila" })).toBeEnabled()
})

test("compra reunida encerrada bloqueia checkout antes dos estados de pagamento", async ({ page }) => {
  await page.goto("/waitlist?status=failure")
  await page.getByRole("button", { name: "Abrir compra encerrada" }).click()
  await expect(page.getByText("Esta compra foi encerrada no pedido que reúne seus carrinhos. Para novos itens, faça um novo pedido com a loja.")).toBeVisible()
  await expect(page.getByText(/Pagamento Falhou|Pagamento confirmado|Pagar com/)).toHaveCount(0)
  await expect(page.getByRole("main").getByRole("button")).toHaveCount(0)
})
