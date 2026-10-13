import "server-only"

import { createHash, randomUUID } from "node:crypto"
import { cache } from "react"

// The checkout token grants access to the cart. Only a one-way reference is
// used for correlation; never log the token, URL, API body or customer details.
export const getCheckoutDiagnosticContext = cache((token: string) => ({
  attemptId: randomUUID(),
  checkoutReference: createHash("sha256").update(token).digest("hex").slice(0, 16),
}))

export function logCheckoutFetch(
  context: ReturnType<typeof getCheckoutDiagnosticContext>,
  outcome: "success" | "http_error" | "timeout" | "network_error" | "invalid_response" | "configuration_error",
  status: number,
  durationMs: number,
) {
  const entry = JSON.stringify({
    message: "checkout_server_fetch",
    ...context,
    outcome,
    status,
    durationMs: Math.round(durationMs),
  })
  if (outcome === "success" || (outcome === "http_error" && status < 500)) console.info(entry)
  else console.warn(entry)
}
