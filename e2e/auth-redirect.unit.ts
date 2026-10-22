import { expect, test } from "@playwright/test"
import { NextRequest, type NextFetchEvent } from "next/server"

import { safeRedirectPath } from "../src/lib/redirect"

// Exercise the actual middleware with only the identity service stubbed.
// Railway's internal URL and the public Host deliberately differ.
const clerkModule = require.resolve("@clerk/nextjs/server")
const clerk = require(clerkModule)
const cached = require.cache[clerkModule]!
const original = cached.exports
cached.exports = {
  ...clerk,
  clerkMiddleware: (handler: (
    auth: () => Promise<{ userId: null; getToken: () => Promise<null> }>,
    req: NextRequest,
  ) => Promise<Response>) => (req: NextRequest) =>
    handler(async () => ({ userId: null, getToken: async () => null }), req),
}
const middleware = require("../src/middleware").default
cached.exports = original

for (const path of ["/events", "/orders?page=3&status=pending", "/settings/integrations"]) {
  test(`login preserves ${path} behind the proxy`, async () => {
    const request = new NextRequest(`https://0.0.0.0:8080${path}`, {
      headers: { host: "app.livecart.com.br" },
    })
    const response = await middleware(request, {} as NextFetchEvent)
    expect(response.status).toBe(307)
    const location = response.headers.get("location")
    expect(location).toMatch(/^\/login\?/)
    const login = new URL(location, "https://app.livecart.com.br")
    expect(login.origin).toBe("https://app.livecart.com.br")
    expect(safeRedirectPath(login.searchParams.get("redirect_url"))).toBe(path)
    expect(location).not.toContain("0.0.0.0")
  })
}

for (const path of ["/login", "/accept-invite?token=test", "/order/test?key=test", "/integracoes/tiny"]) {
  test(`public page does not enter the login redirect: ${path}`, async () => {
    const response = await middleware(new NextRequest(`https://livecart.com.br${path}`, {
      headers: { host: path.startsWith("/integracoes/") ? "livecart.com.br" : "app.livecart.com.br" },
    }), {} as NextFetchEvent)
    expect(response.status).toBe(200)
    expect(response.headers.get("location")).toBeNull()
  })
}

test("login keeps rejecting external return URLs", () => {
  for (const target of ["https://outside.example/orders", "//outside.example/orders", "javascript:alert(1)"]) {
    expect(safeRedirectPath(target)).toBeNull()
  }
})
