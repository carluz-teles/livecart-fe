import { expect, test } from "@playwright/test"
import { billingIntervalDetails } from "../src/lib/billing-presentation"

for (const [name, value] of [
  ["campo ausente na API antiga", undefined],
  ["campo nulo", null],
  ["campo vazio", ""],
  ["intervalo desconhecido", "weekly"],
  ["nome de propriedade de objeto", "toString"],
  ["tipo inválido", 12],
] as const) {
  test(`cobrança com ${name} não quebra nem inventa um valor`, () => {
    expect(billingIntervalDetails(value)).toBeNull()
  })
}

test("assinatura anual apresenta o intervalo e identifica o preço como valor de tabela", () => {
  expect(billingIntervalDetails("annual")).toEqual({
    label: "anual",
    listPriceCents: 644760,
  })
})

test("intervalos mensal e semestral mantêm seus próprios preços de tabela", () => {
  expect(billingIntervalDetails("monthly")).toEqual({
    label: "mensal", listPriceCents: 59700,
  })
  expect(billingIntervalDetails("semestral")).toEqual({
    label: "semestral", listPriceCents: 340290,
  })
})
