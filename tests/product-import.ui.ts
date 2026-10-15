import { expect, test, type Page } from "@playwright/test"
import * as XLSX from "xlsx"
import type {
  ImportRequest,
  ImportResponse,
} from "../src/types/product-import.types"

async function fixture(page: Page, failApply = false) {
  const requests: ImportRequest[] = [],
    applies: ImportRequest[] = [],
    errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route(
    "**/api/v1/stores/audit-store/products/import**",
    async (route) => {
      const body = route.request().postDataJSON() as ImportRequest
      const preview = route.request().url().endsWith("/preview")
      ;(preview ? requests : applies).push(body)
      if (!preview && failApply)
        return route.fulfill({
          status: 409,
          json: { error: "Catálogo mudou. Gere nova prévia." },
        })
      const result: ImportResponse = {
        revision: "abc",
        applied: !preview,
        created: 0,
        updated: body.rows.length,
        invalid: 0,
        rows: body.rows.map((row) => ({
          row: row.row,
          name: row.name ?? "Existente",
          keyword: "1000",
          price: row.price ?? 1234,
          stock: row.stock ?? 7,
          action: "update",
          errors: [],
          warnings: [
            "Estoque preservado: este produto é sincronizado pelo ERP.",
          ],
        })),
      }
      await route.fulfill({ json: { data: result } })
    }
  )
  await page.goto("/product-import")
  return { requests, applies, errors }
}
for (const format of ["xlsx", "xls", "csv"] as const) {
  test(`${format}: worker real, mapeamento, conferência e atualização confirmada`, async ({
    page,
  }) => {
    const state = await fixture(page)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["SKU", "Nome", "Preço", "Estoque"],
        ["0001", "Caneca azul", "12,50", 3],
      ]),
      "Produtos"
    )
    await page.getByLabel("Selecione um arquivo Excel ou CSV").setInputFiles({
      name: `produtos.${format}`,
      mimeType: "application/octet-stream",
      buffer: XLSX.write(wb, { type: "buffer", bookType: format }),
    })
    await expect(
      page.getByLabel("SKU / código do fornecedor", { exact: true })
    ).toHaveValue("0")
    await page.getByRole("button", { name: "Conferir produtos (1)" }).click()
    await expect(page.getByText("Confira antes de salvar")).toBeVisible()
    expect(state.requests[0]).toMatchObject({
      matchBy: "sku",
      rows: [{ sku: "0001", price: 1250, stock: 3 }],
    })
    await expect(
      page.getByRole("button", { name: "Confirmar importação" })
    ).toBeDisabled()
    await expect(
      page.getByText(/Estoque preservado: este produto/)
    ).toBeVisible()
    expect(state.applies).toHaveLength(0)
    await page.getByRole("checkbox").check()
    await page.getByRole("button", { name: "Confirmar importação" }).click()
    await expect(
      page.getByRole("heading", { name: "Catálogo atualizado" })
    ).toBeVisible()
    expect(state.applies).toHaveLength(1)
    expect(state.applies[0].revision).toBe("abc")
    expect(state.errors).toEqual([])
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1
      )
    ).toBe(true)
  })
}
test("mudança no mapeamento invalida prévia e erro de concorrência exige nova conferência", async ({
  page,
}) => {
  const state = await fixture(page, true)
  await page.getByLabel("Selecione um arquivo Excel ou CSV").setInputFiles({
    name: "p.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU;Nome;Preço\n001;Caneca;12,50"),
  })
  await page.getByRole("button", { name: "Conferir produtos (1)" }).click()
  await page.getByRole("checkbox").check()
  await page.getByLabel("Nome do produto", { exact: true }).selectOption("")
  await expect(
    page.getByRole("button", { name: "Confirmar importação" })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Conferir produtos (1)" }).click()
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: "Confirmar importação" }).click()
  await expect(
    page.getByRole("alert").filter({ hasText: "Catálogo mudou" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Confirmar importação" })
  ).toBeDisabled()
  expect(state.applies).toHaveLength(1)
})
test("erro de planilha bloqueia envio e gera arquivo de pendências", async ({
  page,
}) => {
  const state = await fixture(page)
  await page.getByLabel("Selecione um arquivo Excel ou CSV").setInputFiles({
    name: "p.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU;Nome;Preço\n001;Caneca;abc"),
  })
  await expect(
    page.getByRole("alert").filter({ hasText: "Número inválido" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Conferir produtos (1)" })
  ).toBeDisabled()
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Baixar todas as pendências" }).click()
  expect((await download).suggestedFilename()).toBe("pendencias-importacao.csv")
  expect(state.requests).toHaveLength(0)
})
