import { expect, test } from "@playwright/test"

test("vínculo duplicado apresenta a orientação do backend e mantém o formulário aberto", async ({ page }) => {
  const explanation = "esta publicação já está vinculada a uma transmissão; abra a transmissão existente ou libere o vínculo antes de tentar novamente"
  let attempts = 0
  await page.route("https://images.example.test/**", route => route.fulfill({ status: 403, body: "AccessDenied" }))
  await page.route("**/api/v1/stores/audit-store/integrations/instagram/lives", route => route.fulfill({ json: { data: { data: [{ id: "media", username: "loja" }] } } }))
  await page.route("**/api/v1/stores/audit-store/lives/event/sessions/session/platforms", route => {
    attempts++
    return route.fulfill({ status: 409, json: { error: explanation, reason: "SESSION_MEDIA_ALREADY_LINKED" } })
  })
  await page.goto("/log-audit")
  await page.getByRole("button", { name: "Vincular mídia de teste" }).click()
  await page.getByRole("combobox").click()
  await page.getByRole("option", { name: "Live @loja" }).click()
  await page.getByRole("button", { name: "Vincular", exact: true }).click()
  await expect(page.getByText(explanation, { exact: true })).toBeVisible()
  await expect(page.getByRole("dialog")).toBeVisible()
  expect(attempts).toBe(1)
})

test("conciliação financeira permanece visível até confirmação e autenticação reflete recuperação", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.route("https://images.example.test/**", route => route.fulfill({ status: 403, body: "AccessDenied" }))
  await page.goto("/log-audit")
  const alert = page.getByRole("alert").filter({ hasText: "Conciliação financeira pendente" })
  await expect(alert).toContainText("Conciliação financeira pendente no Tiny")
  await expect(alert).toContainText("3.321,07")
  await expect(alert).toContainText("3.087,27")
  await expect(alert).toContainText("Confira os títulos no ERP antes de cobrar, estornar ou liberar")
  await page.getByRole("button", { name: "Exibir parcelas não verificadas" }).click()
  await expect(alert).toContainText("Não foi possível confirmar a divisão")
  await expect(alert).not.toContainText("3.321,07")
  await page.getByRole("button", { name: "Receber conciliação confirmada" }).click()
  await expect(alert).toHaveCount(0)
  await expect(page.getByText("Verificar autenticação", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Receber renovação confirmada" }).click()
  await expect(page.getByText("Conectado", { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test("imagem recusada não recomeça após falha e uma nova URL recupera a foto", async ({ page }) => {
  const requests: string[] = []
  await page.route("https://images.example.test/**", route => {
    requests.push(route.request().url())
    return route.request().url().endsWith("denied.jpg")
      ? route.fulfill({ status: 403, body: "AccessDenied" })
      : route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"/>' })
  })
  await page.goto("/log-audit")
  await expect(page.getByRole("img", { name: "Imagem indisponível: Produto de teste" })).toBeVisible()
  const failedAttempts = requests.length
  expect(failedAttempts).toBeLessThanOrEqual(2) // Initial load and Next hydration can each request the URL.
  // A parent rerender must not retry the refused URL.
  await page.getByRole("button", { name: "Exibir parcelas não verificadas" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "Não foi possível confirmar a divisão" })).toBeVisible()
  expect(requests).toHaveLength(failedAttempts)
  await page.getByRole("button", { name: "Atualizar URL da foto" }).click()
  await expect(page.getByRole("img", { name: "Produto de teste", exact: true })).toHaveJSProperty("naturalWidth", 40)
  expect(requests.slice(failedAttempts)).toEqual(["https://images.example.test/available.jpg"])
})
