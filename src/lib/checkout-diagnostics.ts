export const checkoutDiagnosticEvents = [
  "checkout_loaded", "checkout_ready", "server_error_screen", "client_error",
  "script_load_error", "javascript_error", "unhandled_rejection",
  "hydration_timeout", "offline", "recovered_online",
] as const

export type CheckoutDiagnosticEvent = typeof checkoutDiagnosticEvents[number]

export interface CheckoutDiagnostic {
  attemptId: string
  checkoutReference: string
  event: CheckoutDiagnosticEvent
  elapsedMs: number
  online: boolean
}

export function parseCheckoutDiagnostic(value: unknown): CheckoutDiagnostic | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const data = value as Record<string, unknown>
  const keys = ["attemptId", "checkoutReference", "event", "elapsedMs", "online"]
  if (Object.keys(data).some((key) => !keys.includes(key))) return null
  if (typeof data.attemptId !== "string" || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(data.attemptId)) return null
  if (typeof data.checkoutReference !== "string" || !/^[a-f0-9]{16}$/.test(data.checkoutReference)) return null
  if (!checkoutDiagnosticEvents.includes(data.event as CheckoutDiagnosticEvent)) return null
  if (typeof data.elapsedMs !== "number" || !Number.isInteger(data.elapsedMs) || data.elapsedMs < 0 || data.elapsedMs > 3_600_000) return null
  if (typeof data.online !== "boolean") return null
  return data as unknown as CheckoutDiagnostic
}

// Keep only coarse compatibility information, never the raw User-Agent.
export function checkoutBrowserContext(userAgent: string) {
  const ios = /(?:iPhone OS|CPU OS) (\d+)[_.]/.exec(userAgent)
  const version = /(?:Chrome|CriOS|Firefox|FxiOS|Version)\/(\d+)/.exec(userAgent)
  return {
    browser: /Instagram/i.test(userAgent) ? "instagram"
      : /FBAN|FBAV/i.test(userAgent) ? "facebook"
      : /CriOS|Chrome/i.test(userAgent) ? "chrome"
      : /Firefox|FxiOS/i.test(userAgent) ? "firefox"
      : /Safari/i.test(userAgent) ? "safari" : "other",
    browserMajor: version ? Number(version[1]) : null,
    os: ios ? "ios" : /Android/i.test(userAgent) ? "android" : "other",
    iosMajor: ios ? Number(ios[1]) : null,
  }
}
