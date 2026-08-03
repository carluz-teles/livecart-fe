import type { ApiError } from "@/types"

const DEFAULT_TIMEOUT = 10000 // 10 seconds

/**
 * Como obter um token NOVO do Clerk, ignorando o cache da sessão.
 *
 * O token do Clerk vale ~60 segundos. O que a árvore React entrega ao service
 * pode já ter vencido no caminho — tela aberta parada, aba em segundo plano,
 * requisição em fila, relógio do servidor alguns segundos à frente. Quando isso
 * acontecia, o 401 subia cru para a interface como
 * `{"error":"invalid token: token expired"}` e só um F5 resolvia — porque o F5
 * remonta tudo e pega um token novo.
 *
 * Registrado uma vez pela árvore React (ver AuthTokenBridge). Fica em módulo,
 * e não em contexto, porque quem precisa dele é o `request` abaixo, que roda
 * fora do React.
 */
let refreshAuthToken: (() => Promise<string | null>) | null = null

export function setAuthTokenRefresher(fn: (() => Promise<string | null>) | null) {
  refreshAuthToken = fn
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  token?: string | null,
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<T> {
  const send = async (authToken?: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    // Um AbortController por tentativa: reaproveitar o da primeira faria a
    // segunda nascer já cancelada quando o timeout tivesse disparado.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  try {
    let res = await send(token)

    // UMA nova tentativa com token renovado.
    //
    // Só quando havia token: 401 sem token é "precisa entrar", e insistir ali
    // esconderia o caso legítimo. E só uma vez — se o token novo também for
    // recusado, o problema não é validade e repetir viraria laço.
    if (res.status === 401 && token && refreshAuthToken) {
      const fresh = await refreshAuthToken().catch(() => null)
      if (fresh && fresh !== token) {
        res = await send(fresh)
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "An error occurred" }))
      throw { status: res.status, ...err } as ApiError
    }

    // Handle 204 No Content responses (e.g., DELETE)
    if (res.status === 204) {
      return undefined as T
    }

    const json = await res.json()
    return json.data as T
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw { status: 408, message: "Request timeout" } as ApiError
    }
    throw error
  }
}

// Get base URL without /api/v1 suffix for public routes
function getBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  // Remove /api/v1 suffix if present
  return apiUrl.replace(/\/api\/v1$/, "")
}

async function publicRequest<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const res = await fetch(`${getBaseUrl()}${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "An error occurred" }))
      throw { status: res.status, ...err } as ApiError
    }

    if (res.status === 204) {
      return undefined as T
    }

    const json = await res.json()
    return json.data as T
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw { status: 408, message: "Request timeout" } as ApiError
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

async function multipartRequest<T>(
  url: string,
  form: FormData,
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    // fetch sets the proper multipart boundary automatically when no
    // Content-Type is provided for a FormData body.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "An error occurred" }))
      throw { status: res.status, ...err } as ApiError
    }

    if (res.status === 204) return undefined as T
    const json = await res.json()
    return json.data as T
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw { status: 408, message: "Request timeout" } as ApiError
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export const apiClient = {
  get: <T>(url: string, token?: string | null) => request<T>("GET", url, undefined, token),
  post: <T>(url: string, body: unknown, token?: string | null, timeoutMs?: number) =>
    request<T>("POST", url, body, token, timeoutMs),
  put: <T>(url: string, body: unknown, token?: string | null) => request<T>("PUT", url, body, token),
  patch: <T>(url: string, body: unknown, token?: string | null) => request<T>("PATCH", url, body, token),
  delete: <T>(url: string, token?: string | null) => request<T>("DELETE", url, undefined, token),
  postMultipart: <T>(url: string, form: FormData, token?: string | null) =>
    multipartRequest<T>(url, form, token),
  // Public routes (without /api/v1 prefix)
  publicGet: <T>(url: string) => publicRequest<T>("GET", url),
  publicPost: <T>(url: string, body: unknown) => publicRequest<T>("POST", url, body),
  publicPut: <T>(url: string, body: unknown) => publicRequest<T>("PUT", url, body),
  publicPatch: <T>(url: string, body: unknown) => publicRequest<T>("PATCH", url, body),
  publicDelete: <T>(url: string) => publicRequest<T>("DELETE", url),
}

// For use in React components with Clerk context
export function createAuthenticatedClient(getToken: () => Promise<string | null>) {
  return {
    get: <T>(url: string) => getToken().then((token) => apiClient.get<T>(url, token)),
    post: <T>(url: string, body: unknown) => getToken().then((token) => apiClient.post<T>(url, body, token)),
    put: <T>(url: string, body: unknown) => getToken().then((token) => apiClient.put<T>(url, body, token)),
    patch: <T>(url: string, body: unknown) => getToken().then((token) => apiClient.patch<T>(url, body, token)),
    delete: <T>(url: string) => getToken().then((token) => apiClient.delete<T>(url, token)),
  }
}
