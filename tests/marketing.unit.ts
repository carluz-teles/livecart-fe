import { test, expect } from "@playwright/test"
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server"
import { marketingArticles } from "../src/lib/marketing/content"
import { publicPages } from "../src/lib/marketing/seo"
import { isMarketingPath, marketingRedirect } from "../src/lib/marketing/routes"
import { config } from "../src/middleware"

test("public routes do not widen authentication to lookalike or private paths", () => {
  for (const path of ["/dashboard", "/settings/billing", "/api/stores", "/orders", "/guias-internas", "/integracoes-privadas", "/sobre-cliente", "/register", "/cart/secret"]) {
    expect(isMarketingPath(path), path).toBe(false)
  }
  for (const path of ["/dashboard", "/settings/billing", "/api/stores", "/orders", "/guias-internas"]) {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://app.livecart.com.br${path}` }), path).toBe(true)
  }
  for (const page of publicPages) expect(isMarketingPath(page.path), page.path).toBe(true)
  expect(marketingRedirect("app.livecart.com.br", "/cart/secret", "?key=private")).toBeNull()
  expect(marketingRedirect("www.livecart.com.br", "/guias", "?utm_source=search")).toBe("https://livecart.com.br/guias?utm_source=search")
})

test("public pages have unique destinations, valid related links and supported dates", () => {
  const paths = new Set(publicPages.map((page) => page.path))
  expect(paths.size).toBe(publicPages.length)
  for (const article of marketingArticles) {
    for (const link of article.related) expect(paths.has(link), `${article.path} -> ${link}`).toBe(true)
    expect(Date.parse(article.updated)).not.toBeNaN()
  }
})

test("sitemap URLs serve real public HTML without authentication or placeholder results", async ({ request }, testInfo) => {
  testInfo.setTimeout(180_000)
  const sitemap = await request.get("/sitemap.xml")
  expect(sitemap.status()).toBe(200)
  const xml = await sitemap.text()
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
  expect(paths).toContain("/integracoes/tiny")
  expect(paths).toContain("/integracoes/bling")
  for (const path of paths.filter((value) => !["/privacy", "/terms"].includes(value))) {
    const response = await request.get(path, { maxRedirects: 0, headers: { cookie: "__session=invalid" } })
    expect(response.status(), path).toBe(200)
    expect(response.headers()["x-robots-tag"] ?? "", path).not.toMatch(/noindex/i)
    const html = await response.text()
    expect(html, path).toContain('rel="canonical"')
    expect(html, path).not.toMatch(/<meta[^>]*content="[^"]*noindex[^"]*"/i)
    expect(html, path).not.toContain("Substitua pelos resultados reais")
    expect(html, path).not.toContain("conversão média em lives")
    expect(html, path).toMatch(/<h1[ >]/)
  }
  const missing = await request.get("/integracoes/nao-existe", { maxRedirects: 0 })
  expect(missing.status()).toBe(404)
  for (const extension of ["webm", "mp4"]) {
    const video = await request.get(`/media/demonstracao-codigos.${extension}`, { maxRedirects: 0 })
    expect(video.status()).toBe(200)
    expect(video.headers()["content-type"]).toContain(`video/${extension}`)
  }
  const llms = await request.get("/llms.txt", { maxRedirects: 0 })
  expect(llms.status()).toBe(200)
  expect(llms.headers()["content-type"]).toContain("text/plain")
})

test("marketing host redirects bypass Clerk and preserve campaigns", async ({ request }) => {
  for (const host of ["app.livecart.com.br", "www.livecart.com.br"]) {
    const response = await request.get("/integracoes/tiny?utm_source=search", { maxRedirects: 0, headers: { host, cookie: "__session=invalid" } })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe("https://livecart.com.br/integracoes/tiny?utm_source=search")
  }
})

test("auth routes expose noindex without robots.txt hiding it from crawlers", async ({ request }) => {
  // On the public host the real middleware redirects before calling Clerk.
  // Exercise the real Next headers and redirects without authentication secrets.
  for (const path of ["/login", "/login/factor-one", "/register", "/register/verify-email-address"]) {
    const url = `${path}?redirect_url=%2Faccept-invite%3Ftoken%3Dtest`
    const response = await request.get(url, {
      maxRedirects: 0,
      headers: { host: "livecart.com.br", "user-agent": "Googlebot" },
    })
    expect(response.status(), path).toBe(307)
    expect(response.headers().location, path).toBe(`https://app.livecart.com.br${url}`)
    expect(response.headers()["x-robots-tag"], path).toBe("noindex, follow")
  }

  // A similar prefix must not accidentally inherit the auth indexing rule.
  const unrelated = await request.get("/login-help", {
    maxRedirects: 0,
    headers: { host: "livecart.com.br" },
  })
  expect(unrelated.status()).toBe(307)
  expect(unrelated.headers()["x-robots-tag"]).toBeUndefined()

  const robots = await request.get("/robots.txt")
  expect(robots.status()).toBe(200)
  const text = await robots.text()
  const disallowed = [...text.matchAll(/^Disallow:\s*(\S+)/gm)].map((match) => match[1])
  for (const path of ["/login", "/login/factor-one", "/register", "/register/verify-email-address"]) {
    expect(disallowed.some((prefix) => path.startsWith(prefix)), path).toBe(false)
  }
  expect(disallowed).toEqual(expect.arrayContaining(["/cart/", "/api/", "/settings"]))
})
