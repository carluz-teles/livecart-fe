import { expect, test, type Route } from "@playwright/test"
import type { ERPHealthCheckItem } from "../src/types"

const endpoint = "**/api/v1/stores/audit-store/integrations/audit-integration/erp/health-check"
const items: ERPHealthCheckItem[] = [
  ["forma_recebimento", "Cartão de Crédito"],
  ["forma_recebimento", "Pix"],
  ["forma_pagamento", "Cartão de Crédito"],
  ["forma_pagamento", "Pix"],
  ["forma_envio", "Correios"],
  ["forma_envio", "Jadlog"],
  ["forma_envio", "SmartEnvios"],
].map(([category, name], i) => ({
  category: category as ERPHealthCheckItem["category"], expected_name: name,
  status: "ok", matched_id: i + 1, description: "Cadastro usado nos pedidos", panel_path: "Configurações",
}))
const response = (results = items) => ({ data: { supported: true, checkedAt: new Date().toISOString(), items: results } })

test("resposta após 21 segundos conclui sem cancelar nem repetir a auditoria", async ({ page }) => {
  const requests: Route[] = []
  await page.route(endpoint, route => { requests.push(route) })
  await page.clock.install()
  await page.goto("/erp-health")
  await expect(page.getByRole("status", { name: "Verificando cadastros do Tiny" })).toBeVisible()
  await expect.poll(() => requests.length).toBe(1)
  await page.clock.fastForward(21_000)
  await requests[0].fulfill({ json: response() })
  await expect(page.getByRole("button", { name: "Auditar 7 cadastros do Tiny" })).toBeVisible()
  expect(requests).toHaveLength(1)
  await page.getByRole("button", { name: "Auditar 7 cadastros do Tiny" }).click()
  await expect(page.getByText("Todas as formas de pagamento, recebimento e envio estão cadastradas.", { exact: false })).toBeVisible()
  expect(requests).toHaveLength(1)
  await page.getByRole("button", { name: "Verificar", exact: true }).click()
  await expect.poll(() => requests.length).toBe(2)
  await expect(page.getByRole("button", { name: "Verificar", exact: true })).toBeDisabled()
  await requests[1].fulfill({ json: response() })
  await expect(page.getByRole("button", { name: "Verificar", exact: true })).toBeEnabled()
  expect(requests).toHaveLength(2)
})

test("erro permite repetir pelo botão sem retry automático, reconexão ou nova consulta ao abrir o modal", async ({ page }) => {
  let calls = 0
  await page.route(endpoint, route => {
    calls++
    return calls === 1
      ? route.fulfill({ status: 503, json: { error: "Tiny indisponível temporariamente" } })
      : route.fulfill({ json: response() })
  })
  await page.clock.install()
  await page.goto("/erp-health")
  await expect(page.getByRole("button", { name: "Erro ao verificar cadastros do Tiny" })).toBeVisible()
  await page.clock.fastForward(120_000)
  await page.evaluate(() => { window.dispatchEvent(new Event("offline")); window.dispatchEvent(new Event("online")) })
  await page.getByRole("button", { name: "Erro ao verificar cadastros do Tiny" }).click()
  await expect(page.getByRole("button", { name: "Tentar de novo" })).toBeVisible()
  expect(calls).toBe(1)
  await page.getByRole("button", { name: "Tentar de novo" }).click()
  await expect(page.getByRole("button", { name: "Verificar", exact: true })).toBeEnabled()
  expect(calls).toBe(2)
})

test("sair da auditoria cancela a requisição e uma nova abertura pode verificar", async ({ page }) => {
  let calls = 0
  await page.route(endpoint, route => {
    calls++
    if (calls > 1) return route.fulfill({ json: response() })
  })
  await page.goto("/erp-health")
  await expect.poll(() => calls).toBe(1)
  const aborted = page.waitForEvent("requestfailed", req => req.url().endsWith("/erp/health-check"))
  await page.getByRole("button", { name: "Ocultar auditoria" }).click()
  await aborted
  await page.getByRole("button", { name: "Mostrar auditoria" }).click()
  await expect(page.getByRole("button", { name: "Auditar 7 cadastros do Tiny" })).toBeVisible()
  expect(calls).toBe(2)
})

test("requisição travada termina em 45 segundos sem novas tentativas automáticas", async ({ page }) => {
  let calls = 0
  await page.route(endpoint, () => { calls++ })
  await page.clock.install()
  await page.goto("/erp-health")
  await expect.poll(() => calls).toBe(1)
  await page.clock.fastForward(31_000)
  await expect(page.getByRole("status", { name: "Verificando cadastros do Tiny" })).toBeVisible()
  await page.clock.fastForward(15_000)
  await expect(page.getByRole("button", { name: "Erro ao verificar cadastros do Tiny" })).toBeVisible()
  await page.clock.fastForward(120_000)
  expect(calls).toBe(1)
})

for (const missing of [false, true]) {
  test(`resultado desconhecido não afirma que todos estão OK${missing ? " e preserva ausências confirmadas" : ""}`, async ({ page }) => {
    const results = items.map((item, index) => ({
      ...item, status: (index === 0 ? "unknown" : index === 1 && missing ? "missing" : "ok") as ERPHealthCheckItem["status"],
    }))
    let calls = 0
    await page.route(endpoint, route => { calls++; return route.fulfill({ json: response(results) }) })
    await page.goto("/erp-health")
    const banner = page.getByRole("button", { name: missing ? /1 cadastro do Tiny faltando/ : /Verificação do Tiny incompleta/ })
    await expect(banner).toBeVisible()
    await expect(banner).toContainText("1 cadastro não pôde ser verificado")
    await banner.click()
    await expect(page.getByRole("dialog")).toContainText("1 cadastro não pôde ser verificado")
    await expect(page.getByRole("dialog")).not.toContainText("Todas as formas de pagamento, recebimento e envio estão cadastradas")
    await expect(page.getByRole("dialog").getByText(/Cadastre em/)).toHaveCount(missing ? 1 : 0)
    expect(calls).toBe(1)
  })
}

for (const area of ["painel", "página pública"]) {
  test(`versão anterior na ${area} oferece recarga explícita sem repetir uma ação`, async ({ page }) => {
    await page.route(endpoint, route => route.fulfill({ json: response() }))
    await page.goto("/erp-health")
    await page.getByRole("button", { name: `Simular versão anterior ${area === "painel" ? "no" : "na"} ${area}` }).click()
    await expect(page.getByText(/Esta aba usa uma versão anterior/)).toBeVisible()
    const reload = page.waitForNavigation({ waitUntil: "domcontentloaded" })
    await page.getByRole("button", { name: "Carregar versão atual" }).click()
    await reload
    await expect(page.getByRole("heading", { name: "Diagnóstico de integração" })).toBeVisible()
  })
}
