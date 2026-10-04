import { expect, test, type Page } from "@playwright/test"

const store = { id: "audit-store", cartSettings: { expirationMinutes: 5760, maxQuantityPerItem: 50 } }

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-04T15:00:00Z") })
  await page.route("**/api/v1/stores/me", route => route.fulfill({ json: { data: store } }))
})

async function selectEnd(page: Page, day = 6) {
  await page.getByLabel("Receber compras até").click()
  await page.getByRole("button", { name: new RegExp(`^.*\\b${day} de outubro de 2026`) }).click()
  await page.getByLabel("Horário", { exact: true }).fill("23:59")
  await page.getByLabel("Horário", { exact: true }).press("Escape")
}

test("exige último dia e revisão antes de criar; voltar exige nova confirmação", async ({ page }) => {
  const requests: Record<string, unknown>[] = []
  await page.route("**/api/v1/stores/audit-store/lives", route => {
    requests.push(route.request().postDataJSON())
    return route.fulfill({ json: { data: { id: "new-event" } } })
  })
  await page.goto("/event-window")
  await page.getByRole("button", { name: "Novo Evento", exact: true }).click()
  await page.getByLabel("Nome do evento").fill("Semana 01 até 06")
  await expect(page.getByLabel("Receber compras até")).toContainText("Escolha o último dia")
  await page.getByRole("button", { name: "Revisar datas" }).click()
  await expect(page.getByText("Escolha o último dia e horário para receber compras", { exact: true })).toBeVisible()
  expect(requests).toHaveLength(0)
  await selectEnd(page)
  await page.getByRole("button", { name: "Revisar datas" }).click()
  const summary = page.getByRole("region", { name: "Resumo das datas" })
  await expect(summary).toContainText("terça-feira, 6 de outubro de 2026 às 23:59")
  await expect(summary).toContainText("sábado, 10 de outubro de 2026 às 23:59")
  await expect(summary).toContainText("America/Sao_Paulo")
  await expect(page.getByRole("button", { name: "Confirmar e criar" })).toBeDisabled()
  await page.getByRole("checkbox", { name: /Conferi o dia/ }).check()
  await page.getByRole("button", { name: "Voltar e corrigir" }).click()
  await expect(page.getByLabel("Nome do evento")).toHaveValue("Semana 01 até 06")
  await page.getByRole("button", { name: "Revisar datas" }).click()
  await expect(page.getByRole("checkbox", { name: /Conferi o dia/ })).not.toBeChecked()
  expect(requests).toHaveLength(0)
  await page.getByRole("checkbox", { name: /Conferi o dia/ }).check()
  await page.getByRole("button", { name: "Confirmar e criar" }).click()
  await expect(page.getByRole("heading", { name: "Confirme as datas do evento" })).toHaveCount(0)
  expect(requests).toEqual([expect.objectContaining({ title: "Semana 01 até 06", endsAt: "2026-10-07T02:59:00.000Z", cartExpirationMinutes: 5760 })])
})

test("resposta tardia da loja preserva nome, data e regras digitadas", async ({ page }) => {
  let release!: () => void
  const responseReady = new Promise<void>(resolve => { release = resolve })
  await page.route("**/api/v1/stores/me", async route => { await responseReady; await route.fulfill({ json: { data: store } }) })
  await page.goto("/event-window")
  await page.getByRole("button", { name: "Novo Evento", exact: true }).click()
  await page.getByLabel("Nome do evento").fill("Datas escolhidas")
  await page.getByLabel("Prazo para finalizar após o evento", { exact: true }).fill("120")
  await selectEnd(page)
  release()
  await expect(page.getByRole("button", { name: "Revisar datas" })).toBeEnabled()
  await expect(page.getByLabel("Nome do evento")).toHaveValue("Datas escolhidas")
  await expect(page.getByLabel("Receber compras até")).toContainText("06/10/2026 às 23:59")
  await page.getByRole("button", { name: "Revisar datas" }).click()
  await expect(page.getByRole("region", { name: "Resumo das datas" })).toContainText("2 horas")
  // Simulate a background query update while the modal is open.
  await page.getByRole("button", { name: "Atualizar regras recebidas", includeHidden: true }).evaluate((node: HTMLButtonElement) => node.click())
  await expect(page.getByRole("region", { name: "Resumo das datas" })).toContainText("2 horas")
  await page.getByRole("button", { name: "Voltar e corrigir" }).click()
  await expect(page.getByLabel("Nome do evento")).toHaveValue("Datas escolhidas")
})

test("bloqueia data vencida e revalida se o prazo vence durante a revisão", async ({ page }) => {
  let submissions = 0
  await page.route("**/api/v1/stores/audit-store/lives", route => { submissions++; return route.fulfill({ json: { data: { id: "event" } } }) })
  await page.goto("/event-window")
  await page.getByRole("button", { name: "Novo Evento", exact: true }).click()
  await page.getByLabel("Nome do evento").fill("Data inválida")
  await selectEnd(page, 2)
  await page.getByRole("button", { name: "Revisar datas" }).click()
  await expect(page.getByText("O encerramento precisa estar no futuro", { exact: true })).toBeVisible()
  await selectEnd(page, 6)
  await page.getByRole("button", { name: "Revisar datas" }).click()
  await page.getByRole("checkbox", { name: /Conferi o dia/ }).check()
  await page.clock.setSystemTime(new Date("2026-10-07T03:00:00Z"))
  await page.getByRole("button", { name: "Confirmar e criar" }).click()
  await expect(page.getByText("O encerramento precisa estar no futuro", { exact: true })).toBeVisible()
  expect(submissions).toBe(0)
})

test("edição no celular avisa antecipação e só salva após confirmar", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  const requests: Record<string, unknown>[] = []
  await page.route("**/api/v1/stores/audit-store/lives/event", route => {
    requests.push(route.request().postDataJSON())
    return route.fulfill({ json: { data: { id: "event" } } })
  })
  await page.goto("/event-window")
  await page.getByRole("button", { name: "Editar evento de teste" }).click()
  await page.getByLabel("Nome do evento").fill("Campanha editada")
  await selectEnd(page, 5)
  await page.getByRole("button", { name: "Atualizar evento recebido", includeHidden: true }).evaluate((node: HTMLButtonElement) => node.click())
  await expect(page.getByLabel("Nome do evento")).toHaveValue("Campanha editada")
  await expect(page.getByLabel("Receber compras até")).toContainText("05/10/2026")
  await page.getByRole("button", { name: "Revisar alterações" }).click()
  await expect(page.getByText("Você está antecipando o encerramento", { exact: true })).toBeVisible()
  expect(requests).toHaveLength(0)
  await expect(page.getByRole("button", { name: "Confirmar e salvar" })).toBeDisabled()
  await page.getByRole("checkbox", { name: /Conferi as datas/ }).check()
  const dialog = page.getByRole("dialog")
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
  await page.screenshot({ path: "test-results/event-window/mobile-review.png" })
  await page.getByRole("button", { name: "Confirmar e salvar" }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(requests).toEqual([expect.objectContaining({ endsAt: "2026-10-06T02:59:00.000Z" })])
})
