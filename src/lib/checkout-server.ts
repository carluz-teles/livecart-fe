import "server-only"

import type { PublicCheckoutCart } from "@/types"
import { getCheckoutDiagnosticContext, logCheckoutFetch } from "@/lib/checkout-diagnostics-server"

interface ServerFetchResult {
  cart: PublicCheckoutCart | null
  status: number
  errorMessage: string | null
  errorReason?: string
}

function getPublicApiBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  return apiUrl.replace(/\/api\/v1$/, "")
}

export async function getPublicCheckoutCart(
  token: string
): Promise<ServerFetchResult> {
  const diagnostic = getCheckoutDiagnosticContext(token)
  const started = Date.now()
  const base = getPublicApiBase()
  if (!base) {
    logCheckoutFetch(diagnostic, "configuration_error", 500, Date.now() - started)
    return {
      cart: null,
      status: 500,
      errorMessage: "API URL não configurada",
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${base}/api/public/checkout/${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "X-Request-Id": diagnostic.attemptId },
      signal: controller.signal,
      // Cart state changes constantly (timer, payment status). Never cache.
      cache: "no-store",
    })

    if (!res.ok) {
      logCheckoutFetch(diagnostic, "http_error", res.status, Date.now() - started)
      const body = await res.json().catch(() => ({}))
      return {
        cart: null,
        // O envelope de erro da API usa `error`; `message` fica como fallback
        // para respostas de outras camadas (proxy/edge). Sem ler `error`, toda
        // recusa explícita — carrinho cancelado pela loja, carrinho expirado —
        // virava o genérico "Carrinho não encontrado" e o comprador nunca sabia
        // o que aconteceu.
        status: res.status,
        errorReason: typeof body?.reason === "string" ? body.reason : undefined,
        errorMessage: typeof body?.error === "string" ? body.error
          : typeof body?.message === "string" ? body.message : "Não foi possível carregar o carrinho",
      }
    }

    const json = await res.json()
    if (!json?.data || typeof json.data !== "object" || typeof json.data.status !== "string") {
      logCheckoutFetch(diagnostic, "invalid_response", 502, Date.now() - started)
      return { cart: null, status: 502, errorMessage: "Não foi possível carregar o carrinho. Tente novamente." }
    }
    logCheckoutFetch(diagnostic, "success", 200, Date.now() - started)
    return { cart: json.data as PublicCheckoutCart, status: 200, errorMessage: null }
  } catch (err) {
    logCheckoutFetch(diagnostic, controller.signal.aborted ? "timeout"
      : err instanceof SyntaxError ? "invalid_response" : "network_error", 0, Date.now() - started)
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Tempo esgotado ao carregar o carrinho"
        : "Não foi possível carregar o carrinho"
    return { cart: null, status: 0, errorMessage: message }
  } finally {
    clearTimeout(timeoutId)
  }
}
