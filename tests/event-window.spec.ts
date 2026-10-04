import { expect, test } from "@playwright/test"
import { createEventSchema, updateEventWindowSchema } from "../src/schemas/event.schema"

test("criação exige uma data válida e futura mesmo quando começa agora", () => {
  for (const endsAt of ["", "invalid", "2020-01-01T23:59:00Z"]) {
    const result = createEventSchema.safeParse({ title: "Semana", startsAt: null, endsAt })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "endsAt")).toBe(true)
  }
  expect(createEventSchema.safeParse({ title: "Semana", endsAt: new Date(Date.now() + 86_400_000).toISOString() }).success).toBe(true)
})

test("o fim precisa ser posterior ao início e eventos históricos continuam editáveis", () => {
  const future = new Date(Date.now() + 86_400_000).toISOString()
  expect(createEventSchema.safeParse({ title: "Semana", startsAt: future, endsAt: future }).success).toBe(false)
  expect(updateEventWindowSchema.safeParse({ title: "Semana encerrada", endsAt: "2026-01-01T23:59:00Z" }).success).toBe(true)
  expect(updateEventWindowSchema.safeParse({ title: "Semana", endsAt: "invalid" }).success).toBe(false)
})
