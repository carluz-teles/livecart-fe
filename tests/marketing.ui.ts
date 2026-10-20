import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route(/crisp\.chat|google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
})

test("home explains the product, FAQ is keyboard accessible, integrations navigate", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Transforme comentários das lives do Instagram em pedidos.")
  const question = page.locator("summary").filter({ hasText: "A LiveCart integra com Tiny e Bling?" })
  await question.focus()
  await page.keyboard.press("Enter")
  await expect(question.locator("..").locator("p")).toBeVisible()
  await page.locator("#integracoes").getByRole("link").filter({ hasText: "Tiny (Olist)" }).click()
  await expect(page).toHaveURL(/\/integracoes\/tiny$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tiny (Olist)")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://livecart.com.br/integracoes/tiny")
  expect(errors).toEqual([])
})

test("demo works by keyboard and mobile menu exposes public destinations", async ({ page }, testInfo) => {
  await page.goto("/demonstracao")
  await expect(page.getByRole("button", { name: "Anterior", exact: true })).toBeDisabled()
  await page.getByRole("button", { name: "Próxima etapa" }).click()
  await expect(page.locator("#demo-result")).toContainText("Comentário: 2x 1001")
  await page.getByRole("button", { name: "Próxima etapa" }).click()
  await expect(page.locator("#demo-result")).toContainText("subtotal R$ 70,00")
  const menu = page.getByRole("button", { name: "Menu", exact: true })
  if (await menu.isVisible()) {
    await expect(menu).toHaveAttribute("aria-expanded", "false")
    await menu.click()
    await expect(menu).toHaveAttribute("aria-expanded", "true")
    await page.locator("#mobile-navigation").getByRole("link", { name: "Guias", exact: true }).click()
  } else {
    await page.locator("header nav").getByRole("link", { name: "Guias", exact: true }).click()
  }
  await expect(page).toHaveURL(/\/guias$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Guias")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("guias.png"), fullPage: true })
})

test("pricing reuses periods and all content stays inside a narrow viewport", async ({ page }, testInfo) => {
  await page.goto("/precos")
  await page.getByRole("tab", { name: "Anual" }).click()
  await expect(page.locator("#precos")).toContainText("6.447,60")
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  const app = schemas.map((value) => JSON.parse(value)).find((value) => value["@type"] === "WebApplication")
  expect(app.offers.price).toBe(597)
  await page.setViewportSize({ width: 320, height: 800 })
  for (const route of ["/", "/integracoes", "/integracoes/bling", "/recursos/reserva-estoque", "/casos/canto-da-art", "/demonstracao"]) {
    await page.goto(route)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true)
  }
  await page.screenshot({ path: testInfo.outputPath("demonstracao-320.png"), fullPage: true })
})

test("analytics events exclude query strings and remain optional", async ({ page }) => {
  await page.goto("/demonstracao?email=private@example.test&token=private")
  await page.getByRole("button", { name: "Próxima etapa" }).click()
  const events = await page.evaluate(() => window.dataLayer)
  expect(events).toEqual(expect.arrayContaining([expect.objectContaining({ event: "lc_demo_step", step: 1 })]))
  expect(JSON.stringify(events)).not.toContain("private")
  // A blocked or broken analytics destination must not stop UI actions.
  await page.evaluate(() => { window.gtag = () => { throw new Error("blocked") } })
  await page.getByRole("button", { name: "Próxima etapa" }).click()
  await expect(page.locator("#demo-result")).toContainText("subtotal R$ 70,00")
})
