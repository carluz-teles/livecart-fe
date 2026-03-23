import type { ApiError } from "@/types"

const DEFAULT_TIMEOUT = 10000 // 10 seconds

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const authToken = token

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "An error occurred" }))
      throw { status: res.status, ...err } as ApiError
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

export const apiClient = {
  get: <T>(url: string, token?: string | null) => request<T>("GET", url, undefined, token),
  post: <T>(url: string, body: unknown, token?: string | null) => request<T>("POST", url, body, token),
  put: <T>(url: string, body: unknown, token?: string | null) => request<T>("PUT", url, body, token),
  patch: <T>(url: string, body: unknown, token?: string | null) => request<T>("PATCH", url, body, token),
  delete: <T>(url: string, token?: string | null) => request<T>("DELETE", url, undefined, token),
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
