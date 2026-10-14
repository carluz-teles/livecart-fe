import { expect, test, type Page } from "@playwright/test"
import { readFile } from "node:fs/promises"
import path from "node:path"

// Model the SDK's async queue. A hidden chat can still be open: callers must
// close it too. No request or conversation is sent to the real Crisp account.
const crispSDK = `(() => {
  const queue = window.$crisp || [];
  const widget = document.createElement('div');
  widget.dataset.testid = 'crisp-widget';
  widget.textContent = 'Atendimento LiveCart';
  document.body.appendChild(widget);
  let visible = true;
  let open = false;
  const apply = ([action, name, values]) => {
    if (action === 'do') {
      if (name === 'chat:show') visible = true;
      if (name === 'chat:hide') visible = false;
      if (name === 'chat:open') open = true;
      if (name === 'chat:close') open = false;
    }
    if (action === 'set' && name === 'user:email') widget.dataset.email = values[0];
    if (action === 'set' && name === 'user:nickname') widget.dataset.name = values[0];
    widget.hidden = !visible && !open;
    widget.dataset.open = String(open);
  };
  window.$crisp = { push: apply };
  queue.forEach(apply);
})();`

async function leaveLanding(page: Page) {
  if (await page.getByRole("button", { name: "Menu", exact: true }).isVisible()) {
    await page.getByRole("button", { name: "Menu", exact: true }).click()
  }
  await page.getByRole("link", { name: "Ir para o dashboard" }).filter({ visible: true }).click()
  await expect(page.getByTestId("route")).toHaveText("/dashboard")
}

test.beforeEach(async ({ page }) => {
  // Serve the actual repository assets without duplicating them into the fixture.
  await page.route(/\/integrations\/|\/livecart\/|\/_next\/image\?/, async (route) => {
    const url = new URL(route.request().url())
    const asset = url.pathname === "/_next/image" ? url.searchParams.get("url")! : url.pathname
    const body = await readFile(path.join(process.cwd(), "public", asset))
    await route.fulfill({ body, contentType: asset.endsWith(".svg") ? "image/svg+xml" : "image/png" })
  })
})

for (const route of ["/cart/test", "/cart/test/catalog", "/order/123", "/login", "/dashboard", "/privacy"]) {
  test(`direct ${route} never loads Crisp`, async ({ page }) => {
    const requests: string[] = []
    await page.route("https://**.crisp.chat/**", async (request) => {
      requests.push(request.request().url())
      await request.fulfill({ contentType: "text/javascript", body: crispSDK })
    })
    await page.goto(route)
    await expect(page.getByTestId("route")).toHaveAttribute("data-ready", "true")
    expect(requests).toEqual([])
    expect(await page.evaluate(() => typeof window.$crisp)).toBe("undefined")
    await expect(page.getByTestId("crisp-widget")).toHaveCount(0)
  })
}

test("landing loads chat once, keeps identity and hides it during SPA navigation", async ({ page }) => {
  let loads = 0
  await page.route("https://client.crisp.chat/l.js", async (route) => {
    loads++
    await route.fulfill({ contentType: "text/javascript", body: crispSDK })
  })
  await page.goto("/?campaign=instagram#integracoes")
  const widget = page.getByTestId("crisp-widget")
  await expect(widget).toBeVisible()
  await expect(widget).toHaveAttribute("data-email", "lojista@example.test")
  await expect(widget).toHaveAttribute("data-name", "Lojista Teste")
  await page.evaluate(() => window.$crisp?.push(["do", "chat:open"]))
  await expect(widget).toHaveAttribute("data-open", "true")

  await leaveLanding(page)
  await expect(widget).toHaveCount(1) // Same document; no full-page reload.
  await expect(widget).toBeHidden()
  await expect(widget).toHaveAttribute("data-open", "false")
  await page.getByRole("link", { name: "Ir ao checkout" }).click()
  await expect(page.getByTestId("route")).toHaveText("/cart/checkout-test")
  await expect(widget).toBeHidden()
  await page.getByRole("link", { name: "Voltar à landing" }).click()
  await expect(widget).toBeVisible()
  expect(loads).toBe(1)

  await page.goBack()
  await expect(widget).toBeHidden()
  await page.goForward()
  await expect(widget).toBeVisible()
  expect(loads).toBe(1)
})

test("a delayed SDK stays hidden if the visitor has already left the landing", async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let requested!: () => void
  const sdkRequested = new Promise<void>((resolve) => { requested = resolve })
  await page.route("https://client.crisp.chat/l.js", async (route) => {
    requested()
    await gate
    await route.fulfill({ contentType: "text/javascript", body: crispSDK })
  })

  await page.goto("/", { waitUntil: "domcontentloaded" })
  await sdkRequested
  await leaveLanding(page)
  release()
  const widget = page.getByTestId("crisp-widget")
  await expect(widget).toHaveCount(1)
  await expect(widget).toBeHidden()
  await expect(widget).toHaveAttribute("data-open", "false")
  await page.getByRole("link", { name: "Voltar à landing" }).click()
  await expect(widget).toBeVisible()
})

test("blocked Crisp does not break the landing or navigation", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("https://client.crisp.chat/l.js", (route) => route.abort())
  await page.goto("/")
  await expect(page.locator("#integracoes")).toBeVisible()
  await leaveLanding(page)
  await expect(page.getByTestId("crisp-widget")).toHaveCount(0)
  expect(errors).toEqual([])
})

test("integration section fits the viewport and loads every existing logo", async ({ page }, testInfo) => {
  await page.route("https://client.crisp.chat/l.js", (route) => route.fulfill({ contentType: "text/javascript", body: crispSDK }))
  await page.goto("/#integracoes")
  const list = page.getByRole("list", { name: "Integrações disponíveis" })
  await expect(list.getByRole("listitem")).toHaveCount(8)
  for (const name of ["Bling", "Mercado Pago", "Instagram", "WhatsApp"]) {
    await expect(list.getByText(name, { exact: true })).toBeVisible()
  }
  const logos = list.getByRole("img")
  await expect(logos).toHaveCount(4)
  for (const logo of await logos.all()) {
    await expect(logo).toBeVisible()
    await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.locator("#integracoes").screenshot({ path: testInfo.outputPath("integrations.png") })
})
