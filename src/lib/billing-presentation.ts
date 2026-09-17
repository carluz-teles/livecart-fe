import { BILLING_INTERVAL_LABELS, PRO_PLAN_PRICE_CENTS } from "@/lib/constants"

// Older API responses omitted the interval. Do not invent a monthly price for
// an annual subscription, or treat an unknown price as a zero-value invoice.
export function billingIntervalDetails(interval: unknown) {
  if (interval !== "monthly" && interval !== "semestral" && interval !== "annual") {
    return null
  }
  return {
    label: BILLING_INTERVAL_LABELS[interval].toLowerCase(),
    listPriceCents: PRO_PLAN_PRICE_CENTS[interval],
  }
}
