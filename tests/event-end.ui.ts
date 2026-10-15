import { expect, test, type Page } from "@playwright/test"

const event = {
  id: "event", title: "Campanha de outubro", status: "active", endsAt: "2026-10-19T02:59:00Z",
  scheduledAt: null, sessions: [], sessionTypes: [], totalOrders: 68, closeCartOnEventEnd: true,
  cartExpirationMinutes: 14400, effectiveCartExpirationMinutes: 14400,
  autoSendCheckoutLinks: false, waitlistNotifiedTtlMinutes: 30,
}

async function serveEvent(page: Page, overrides: Record<string, unknown> = {}) {
  await page.route("**/api/v1/stores/audit-store/lives/event", route => route.fulfill({ json: { data: { ...event, ...overrides } } }))
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-14T17:00:00Z") })
  await page.route("**/api/v1/**", route => route.fulfill({ json: { data: { data: [], total: 0 } } }))
  await serveEvent(page)
})

test("mostra dez dias, vencimento, fila e envio desativado; cancelar não encerra", async ({ page }) => {
  let submissions = 0
  await page.route("**/lives/event/end", route => { submissions++; return route.fulfill({ json: { data: {} } }) })
  await page.goto("/event-end")
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toContainText("10 dias após o encerramento")
  await expect(dialog).toContainText("sábado, 24 de outubro de 2026 às 14:00")
  await expect(dialog).toContainText("Mais 30 minutos: até sábado, 24 de outubro de 2026 às 14:30")
  await expect(dialog).toContainText("Desativado nesta loja")
  await expect(dialog).toContainText("Finalizar o evento não enviará novas mensagens")
  await expect(dialog).toContainText("Só terminou uma transmissão?")
  await expect(dialog).toContainText("America/Sao_Paulo")
  await page.screenshot({ path: "test-results/event-window/end-desktop.png", animations: "disabled" })
  await page.getByRole("button", { name: "Continuar evento" }).click()
  await expect(dialog).toBeHidden()
  expect(submissions).toBe(0)
})

test("usa o prazo efetivo estendido, mostra envio ativado sem prometer entrega e cabe no celular", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await serveEvent(page, { closeCartOnEventEnd: false, effectiveCartExpirationMinutes: 10080, autoSendCheckoutLinks: true, waitlistNotifiedTtlMinutes: 0 })
  await page.goto("/event-end")
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toContainText("7 dias após o encerramento")
  await expect(dialog).toContainText("quarta-feira, 21 de outubro de 2026 às 14:00")
  await expect(dialog).toContainText("Ativado nesta loja")
  await expect(dialog).toContainText("A entrega depende das permissões")
  await expect(dialog).not.toContainText("Para quem ainda aguarda estoque")
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
  expect(await dialog.evaluate(node => node.getBoundingClientRect().height <= window.innerHeight)).toBe(true)
  await page.getByRole("button", { name: "Finalizar evento", exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole("button", { name: "Finalizar evento", exact: true })).toBeInViewport()
  await page.screenshot({ path: "test-results/event-window/end-mobile.png", animations: "disabled" })
})

test("atualiza a previsão enquanto o diálogo fica aberto e ao reabrir", async ({ page }) => {
  await page.goto("/event-end")
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  await page.clock.fastForward(120_000)
  await expect(page.getByRole("alertdialog")).toContainText("24 de outubro de 2026 às 14:02")
  await page.getByRole("button", { name: "Continuar evento" }).click()
  await page.clock.fastForward(120_000)
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  await expect(page.getByRole("alertdialog")).toContainText("24 de outubro de 2026 às 14:04")
})

test("avisa sobre encerramento vencido sem conceder novo prazo a partir de agora", async ({ page }) => {
  await serveEvent(page, { endsAt: "2026-10-13T02:59:00Z" })
  await page.goto("/event-end")
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  await expect(page.getByRole("alertdialog")).toContainText("22 de outubro de 2026 às 23:59")
  await expect(page.getByRole("alertdialog")).toContainText("Finalizar agora não reinicia a contagem")
})

test("dados incompletos bloqueiam confirmação e permitem atualizar sem supor envio desativado", async ({ page }) => {
  await serveEvent(page, { effectiveCartExpirationMinutes: undefined, autoSendCheckoutLinks: undefined })
  await page.goto("/event-end")
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  await expect(page.getByRole("button", { name: "Finalizar evento", exact: true })).toBeDisabled()
  await expect(page.getByRole("alertdialog")).toContainText("Não foi possível consultar")
  await expect(page.getByRole("alertdialog")).not.toContainText("Desativado nesta loja")
  await serveEvent(page)
  await page.getByRole("button", { name: "Atualizar dados" }).click()
  await expect(page.getByRole("button", { name: "Finalizar evento", exact: true })).toBeEnabled()
})

test("mantém confirmação durante envio e erro; nova tentativa envia só a ação de encerramento", async ({ page }) => {
  const requests: unknown[] = []
  let release!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route("**/lives/event/end", async route => {
    requests.push(route.request().postDataJSON())
    if (requests.length === 1) {
      await pending
      await route.fulfill({ status: 500, json: { error: "temporary error" } })
    } else await route.fulfill({ json: { data: { live: { ...event, status: "ended" }, cartsFinalized: 60, autoSendLinks: false } } })
  })
  await page.goto("/event-end")
  await page.getByRole("button", { name: "Revisar encerramento" }).click()
  await page.getByRole("button", { name: "Finalizar evento", exact: true }).click()
  await expect(page.getByRole("button", { name: "Finalizando…" })).toBeDisabled()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("alertdialog")).toBeVisible()
  release()
  await expect(page.getByRole("alertdialog")).toContainText("Não foi possível finalizar o evento")
  await expect(page.getByRole("button", { name: "Finalizar evento", exact: true })).toBeEnabled()
  await page.getByRole("button", { name: "Finalizar evento", exact: true }).click()
  await expect(page.getByRole("alertdialog")).toBeHidden()
  expect(requests).toEqual([{}, {}])
})
