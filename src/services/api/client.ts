import type { ApiError } from "@/types"

async function getToken(): Promise<string | null> {
  // TODO: Implement with Clerk
  // import { auth } from "@clerk/nextjs"
  // const { getToken } = auth()
  // return getToken()
  return null
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const token = await getToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "An error occurred" }))
    throw { status: res.status, ...err } as ApiError
  }

  const json = await res.json()
  return json.data as T
}

export const apiClient = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body: unknown) => request<T>("POST", url, body),
  put: <T>(url: string, body: unknown) => request<T>("PUT", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string) => request<T>("DELETE", url),
}
