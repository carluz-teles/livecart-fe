import "server-only"

import type { PublicCatalog } from "@/services/api/public-catalog.service"

interface ServerFetchResult {
  catalog: PublicCatalog | null
  status: number
  errorMessage: string | null
}

function getPublicApiBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  return apiUrl.replace(/\/api\/v1$/, "")
}

/**
 * Fetches the public live catalog on the server so the page can render
 * status/empty screens without shipping a client fetch on first paint. The
 * result is also handed to React Query as initialData in the client.
 */
export async function getPublicCatalog(
  eventId: string
): Promise<ServerFetchResult> {
  const base = getPublicApiBase()
  if (!base) {
    return {
      catalog: null,
      status: 500,
      errorMessage: "API URL não configurada",
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${base}/api/public/events/${eventId}/catalog`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      // The catalog changes during a live (stock, new products). Never cache.
      cache: "no-store",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return {
        catalog: null,
        status: res.status,
        errorMessage: body?.error || body?.message || "Catálogo não encontrado",
      }
    }

    const json = await res.json()
    return { catalog: json.data as PublicCatalog, status: 200, errorMessage: null }
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Tempo esgotado ao carregar o catálogo"
        : "Não foi possível carregar o catálogo"
    return { catalog: null, status: 0, errorMessage: message }
  } finally {
    clearTimeout(timeoutId)
  }
}
