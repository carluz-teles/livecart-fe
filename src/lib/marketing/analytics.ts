import { isMarketingPath } from "@/lib/marketing/routes"

type MarketingEvent = "lc_marketing_view" | "lc_trial_click" | "lc_demo_step" | "lc_store_created" | "lc_session_created" | "lc_subscription_checkout" | "lc_subscription_activated"
interface MarketingProperties { page_path?: string; placement?: string; step?: number }

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: "event", event: string, properties: Record<string, string | number>) => void
  }
}

// Reuse the installed analytics destination. Never initialize a second GA/GTM
// account, include shopper tokens, or send URLs/query strings/identity fields.
export function trackMarketingEvent(event: MarketingEvent, properties: MarketingProperties = {}) {
  if (typeof window === "undefined") return
  const path = properties.page_path ?? window.location.pathname
  const safe: Record<string, string | number> = { product: "livecart" }
  if (isMarketingPath(path)) safe.page_path = path
  if (properties.placement && /^[a-z_]{1,40}$/.test(properties.placement)) safe.placement = properties.placement
  if (Number.isInteger(properties.step) && properties.step! >= 0 && properties.step! <= 10) safe.step = properties.step!
  try {
    if (typeof window.gtag === "function") window.gtag("event", event, safe)
    else {
      window.dataLayer ??= []
      window.dataLayer.push({ event, ...safe })
    }
  } catch {
    // A blocked tag must never prevent navigation, payment or onboarding.
  }
}
