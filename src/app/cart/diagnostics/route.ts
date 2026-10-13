import { checkoutBrowserContext, parseCheckoutDiagnostic } from "@/lib/checkout-diagnostics"

export const runtime = "nodejs"

// Telemetry is untrusted and unauthenticated. Bound both memory and log volume
// per process; correctness of the checkout never depends on accepting an event.
const attempts = new Map<string, { count: number; expires: number }>()
let windowStart = 0
let windowCount = 0

async function readBoundedBody(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) throw new Error("missing body")
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      (async () => {
        const parts: Uint8Array[] = []
        let size = 0
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          size += value.byteLength
          if (size > 1024) throw new Error("body too large")
          parts.push(value)
        }
        return JSON.parse(Buffer.concat(parts).toString("utf8")) as unknown
      })(),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("body timeout")), 2000) }),
    ])
  } finally {
    clearTimeout(timeout)
    void reader.cancel().catch(() => {})
  }
}

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403 })
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      if (new URL(origin).host !== (request.headers.get("host") || new URL(request.url).host)) return new Response(null, { status: 403 })
    } catch { return new Response(null, { status: 403 }) }
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) return new Response(null, { status: 415 })
  let diagnostic
  try { diagnostic = parseCheckoutDiagnostic(await readBoundedBody(request)) }
  catch { return new Response(null, { status: 400 }) }
  if (!diagnostic) return new Response(null, { status: 400 })

  const now = Date.now()
  if (now - windowStart >= 60_000) { windowStart = now; windowCount = 0 }
  if (windowCount >= 600) return new Response(null, { status: 429 })
  for (const [id, entry] of attempts) if (entry.expires <= now) attempts.delete(id)
  const entry = attempts.get(diagnostic.attemptId) || { count: 0, expires: now + 900_000 }
  if (entry.count >= 8 || (!attempts.has(diagnostic.attemptId) && attempts.size >= 2000)) return new Response(null, { status: 429 })
  entry.count++
  windowCount++
  attempts.set(diagnostic.attemptId, entry)

  console.info(JSON.stringify({
    message: "checkout_browser_diagnostic", source: "untrusted_browser", ...diagnostic,
    ...checkoutBrowserContext((request.headers.get("user-agent") || "").slice(0, 512)),
  }))
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } })
}
