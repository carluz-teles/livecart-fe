import type { PublicOrder } from "@/types/order-tracking.types"

// The public order endpoint lives at `/api/public/orders/:shortId?key=...` —
// outside `/api/v1` because it's unauthenticated. We hit it directly with
// fetch instead of the apiClient (which assumes the v1 prefix and Bearer
// auth) so the route stays explicit.
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ""

// Strip `/api/v1` if present — the public endpoint sits at `/api/public/...`,
// not under v1.
function publicBase(): string {
  if (apiBase.endsWith("/api/v1")) return apiBase.slice(0, -"/api/v1".length)
  if (apiBase.endsWith("/api/v1/")) return apiBase.slice(0, -"/api/v1/".length)
  return apiBase
}

interface ApiEnvelope<T> {
  data: T
}

export async function fetchPublicOrder(
  shortId: string,
  key: string,
): Promise<PublicOrder | null> {
  const url = `${publicBase()}/api/public/orders/${encodeURIComponent(shortId)}?key=${encodeURIComponent(key)}`
  const res = await fetch(url, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Falha ao carregar pedido (${res.status})`)
  }
  const json = (await res.json()) as ApiEnvelope<PublicOrder>
  return json.data
}

// Customer-facing "Recebi!" CTA on the public tracking page.
export async function confirmPublicDelivery(
  shortId: string,
  key: string,
): Promise<void> {
  const url = `${publicBase()}/api/public/orders/${encodeURIComponent(shortId)}/confirm-delivery?key=${encodeURIComponent(key)}`
  const res = await fetch(url, { method: "POST" })
  if (!res.ok) throw new Error(`Falha ao confirmar entrega (${res.status})`)
}
