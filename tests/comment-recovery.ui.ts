import { expect, test, type Page } from "@playwright/test"

const comment = {
  id: "audit-comment", platformCommentId: "instagram-original", handle: "compradora",
  text: "1923 X 1", result: "no_product", hasPurchaseIntent: true, hidden: false,
  createdAt: "2026-10-20T14:37:46Z",
}

async function showComment(page: Page, options: { result?: string; ended?: boolean; error?: string; status?: number; recoveryStatus?: string; recoveryReason?: string } = {}) {
  let posts = 0
  let result = options.result ?? "no_product"
  let pendingReads = 0
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request()
    if (request.method() === "POST") {
      posts++
      expect(new URL(request.url()).pathname).toBe("/api/v1/stores/audit-store/lives/audit-event/comments/audit-comment/recover")
      expect(request.postDataJSON()).toEqual({ confirmed: true })
      if (options.error) {
        await route.fulfill({ status: options.status ?? 422, json: { error: options.error } })
        return
      }
      result = "recovery_pending"
      await route.fulfill({ json: { data: { status: "queued" } } })
      return
    }
    if (result === "recovery_pending" && pendingReads++ > 0) result = "added_to_cart"
    await route.fulfill({ json: { data: { data: [{ ...comment, result, recoveryStatus: options.recoveryStatus, recoveryReason: options.recoveryReason }] } } })
  })
  await page.goto(`/comments${options.ended ? "?ended=1" : ""}`)
  await page.getByRole("button", { name: /Ver comentário de @compradora/ }).click()
  return { posts: () => posts }
}

test("recuperação exige confirmação e acompanha o resultado sem duplicar a solicitação", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  const counter = await showComment(page)
  await page.getByRole("button", { name: "Recuperar comentário", exact: true }).click()
  await expect(page.getByRole("alertdialog")).toContainText("1923 X 1")
  expect(counter.posts()).toBe(0)
  await page.getByRole("button", { name: "Confirmar recuperação", exact: true }).click()
  await expect(page.getByRole("alertdialog")).not.toBeVisible()
  await expect(page.getByText("recuperação em andamento", { exact: true }).first()).toBeVisible()
  await expect(page.getByRole("region", { name: "Resultado do comentário" }).getByText("No carrinho", { exact: true })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole("button", { name: "Recuperar comentário", exact: true })).toHaveCount(0)
  expect(counter.posts()).toBe(1)
  expect(errors).toEqual([])
})

test("recusa por produto ausente mostra motivo e preserva comentário", async ({ page }) => {
  const counter = await showComment(page, { error: "Cadastre o produto 1923 antes de recuperar este comentário." })
  await page.getByRole("button", { name: "Recuperar comentário", exact: true }).click()
  await page.getByRole("button", { name: "Confirmar recuperação", exact: true }).click()
  await expect(page.getByRole("alert")).toHaveText("Cadastre o produto 1923 antes de recuperar este comentário.")
  await expect(page.getByRole("alertdialog")).toContainText("1923 X 1")
  expect(counter.posts()).toBe(1)
})

test("resposta incerta orienta conferir resultado antes de repetir", async ({ page }) => {
  const counter = await showComment(page, { status: 408, error: "Request timeout" })
  await page.getByRole("button", { name: "Recuperar comentário", exact: true }).click()
  await page.getByRole("button", { name: "Confirmar recuperação", exact: true }).click()
  await expect(page.getByRole("alert")).toContainText("a recuperação pode já estar em andamento")
  expect(counter.posts()).toBe(1)
})

test("evento encerrado impede solicitação", async ({ page }) => {
  const counter = await showComment(page, { ended: true })
  await expect(page.getByRole("button", { name: "Recuperar comentário", exact: true })).toBeDisabled()
  expect(counter.posts()).toBe(0)
})

for (const result of ["no_product", "added_to_cart", "waitlisted"]) {
test(`recusa definitiva com resultado ${result} persiste sem oferecer outra tentativa`, async ({ page }) => {
  const counter = await showComment(page, {
    result,
    recoveryStatus: "rejected",
    recoveryReason: "Carrinho pago ou fechado para novos itens.",
  })
  await expect(page.getByText("Recuperação interrompida", { exact: true })).toBeVisible()
  await expect(page.getByText("Carrinho pago ou fechado para novos itens.", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Recuperar comentário", exact: true })).toHaveCount(0)
  await page.reload()
  await page.getByRole("button", { name: /Ver comentário de @compradora/ }).click()
  await expect(page.getByText("Carrinho pago ou fechado para novos itens.", { exact: true })).toBeVisible()
  expect(counter.posts()).toBe(0)
})
}

for (const result of ["added_to_cart", "blocked", "event_ended", "recovery_pending"]) {
  test(`resultado ${result} não oferece nova recuperação`, async ({ page }) => {
    const counter = await showComment(page, { result })
    await expect(page.getByRole("button", { name: "Recuperar comentário", exact: true })).toHaveCount(0)
    expect(counter.posts()).toBe(0)
  })
}
