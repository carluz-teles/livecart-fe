import "server-only"

import type { PublicCheckoutCart } from "@/types"

interface ServerFetchResult {
  cart: PublicCheckoutCart | null
  status: number
  errorMessage: string | null
}

function getPublicApiBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  return apiUrl.replace(/\/api\/v1$/, "")
}

export async function getPublicCheckoutCart(
  token: string
): Promise<ServerFetchResult> {
  const base = getPublicApiBase()
  if (!base) {
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
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      // Cart state changes constantly (timer, payment status). Never cache.
      cache: "no-store",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return {
        cart: null,
        status: res.status,
        errorMessage: body?.message || "Carrinho não encontrado",
      }
    }

    const json = await res.json()
    return { cart: json.data as PublicCheckoutCart, status: 200, errorMessage: null }
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Tempo esgotado ao carregar o carrinho"
        : "Não foi possível carregar o carrinho"
    return { cart: null, status: 0, errorMessage: message }
  } finally {
    clearTimeout(timeoutId)
  }
}
