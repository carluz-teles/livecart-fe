import { expect, test } from "@playwright/test"
import { eventCartDeadline, previewEventEnd } from "../src/lib/event-deadline"
import type { Event } from "../src/types/event.types"

const event = {
  status: "active", endsAt: "2026-10-19T02:59:00Z", cartExpirationMinutes: 7200,
  effectiveCartExpirationMinutes: 14400, autoSendCheckoutLinks: false, waitlistNotifiedTtlMinutes: 30,
} as Event

test("a previsão usa o prazo efetivo da API e o encerramento agora, incluindo adicional de fila", () => {
  expect(previewEventEnd(event, Date.parse("2026-10-14T17:00:00Z"))).toMatchObject({
    expirationMinutes: 14400, closedAt: "2026-10-14T17:00:00.000Z",
    deadline: "2026-10-24T17:00:00.000Z", waitlistDeadline: "2026-10-24T17:30:00.000Z", autoSendLinks: false,
  })
})

test("finalização atrasada preserva o fim programado e não reinicia os dez dias", () => {
  expect(previewEventEnd(event, Date.parse("2026-10-20T17:00:00Z"))).toMatchObject({
    deadline: "2026-10-29T02:59:00.000Z", scheduledEndPassed: true,
  })
})

test("não inventa prazo nem envio quando a API está incompleta ou o evento terminou", () => {
  const now = Date.parse("2026-10-14T17:00:00Z")
  for (const override of [
    { effectiveCartExpirationMinutes: undefined }, { effectiveCartExpirationMinutes: NaN },
    { effectiveCartExpirationMinutes: 0 }, { autoSendCheckoutLinks: undefined }, { status: "ended" as const },
  ]) expect(previewEventEnd({ ...event, ...override }, now)).toBeNull()
  expect(previewEventEnd({ ...event, waitlistNotifiedTtlMinutes: 0 }, now)?.waitlistDeadline).toBeNull()
  expect(eventCartDeadline("invalid", 60)).toBeNull()
  expect(eventCartDeadline("2026-10-14T17:00:00Z", undefined)).toBeNull()
})
