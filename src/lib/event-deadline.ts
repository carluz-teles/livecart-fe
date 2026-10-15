import type { Event } from "@/types/event.types"

export function eventCartDeadline(closedAt: string, minutes: number | null | undefined): string | null {
  const base = new Date(closedAt).getTime()
  if (!Number.isFinite(base) || minutes == null || !Number.isFinite(minutes) || minutes < 0) return null
  const deadline = new Date(base + minutes * 60_000)
  return Number.isFinite(deadline.getTime()) ? deadline.toISOString() : null
}

/** Display estimate only; the server assigns and preserves actual cart deadlines. */
export function previewEventEnd(event: Event, now: number) {
  const minutes = event.effectiveCartExpirationMinutes
  const scheduledEnd = event.endsAt ? new Date(event.endsAt).getTime() : NaN
  if (event.status === "ended" || !Number.isFinite(now) ||
    minutes == null || minutes < 15 || !Number.isFinite(minutes) ||
    typeof event.autoSendCheckoutLinks !== "boolean") return null

  // A late close must not restart the countdown from the time of the click.
  const closedAt = new Date(Number.isFinite(scheduledEnd) ? Math.min(now, scheduledEnd) : now).toISOString()
  const deadline = eventCartDeadline(closedAt, minutes)
  if (!deadline) return null
  const extraMinutes = event.waitlistNotifiedTtlMinutes
  return {
    closedAt,
    deadline,
    expirationMinutes: minutes,
    extraMinutes,
    waitlistDeadline: extraMinutes > 0 ? eventCartDeadline(closedAt, minutes + extraMinutes) : null,
    autoSendLinks: event.autoSendCheckoutLinks,
    scheduledEndPassed: Number.isFinite(scheduledEnd) && scheduledEnd < now,
  }
}
