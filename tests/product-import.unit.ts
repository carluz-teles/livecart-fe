import { expect, test } from "@playwright/test"
import * as XLSX from "xlsx"
import { readSpreadsheet } from "../src/lib/product-import/spreadsheet"
import {
  errorCSV,
  mapSpreadsheet,
  suggestHeader,
  suggestMapping,
} from "../src/lib/product-import/mapping"
import { isStaleDeploymentError } from "../src/lib/deployment-error"

for (const format of ["xlsx", "xls", "csv"] as const) {
  test(`lê ${format} com acentos, zeros no SKU e preço brasileiro`, () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["SKU", "Nome", "Preço", "Estoque"],
        ["0000123", "Laço maçã", "1.234,56", "0"],
      ]),
      "Catálogo"
    )
    const sheets = readSpreadsheet(
      XLSX.write(wb, { type: "array", bookType: format }),
      `produtos.${format}`
    )
    const sheet = sheets[0],
      mapped = mapSpreadsheet(sheet, 0, suggestMapping(sheet.rows[0]), ",")
    expect(mapped.errors).toEqual([])
    expect(mapped.rows).toEqual([
      { row: 2, sku: "0000123", name: "Laço maçã", price: 123456, stock: 0 },
    ])
  })
}
test("seleciona aba e cabeçalho após título; preserva códigos formatados", () => {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([["Informações"]]),
    "Instruções"
  )
  const ws = XLSX.utils.aoa_to_sheet([
    ["Catálogo outubro"],
    [],
    ["SKU", "Nome", "Preço"],
    [123, "Caneca", 19.9],
  ])
  ws.A4.z = "000000"
  XLSX.utils.book_append_sheet(wb, ws, "Produtos")
  const sheets = readSpreadsheet(
    XLSX.write(wb, { type: "array", bookType: "xlsx" }),
    "catalogo.xlsx"
  )
  const header = suggestHeader(sheets[1])
  expect(header).toBe(2)
  const mapped = mapSpreadsheet(
    sheets[1],
    header,
    suggestMapping(sheets[1].rows[header]),
    ","
  )
  expect(mapped.rows[0]).toMatchObject({ row: 4, sku: "000123", price: 1990 })
})
test("CSV Windows-1252 e delimitador explícito", () => {
  const data = Buffer.from('SKU;Nome;Preço\r\n001;Laço;"10,50"', "latin1")
  const sheets = readSpreadsheet(
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    "velho.csv",
    ";",
    "windows-1252"
  )
  expect(
    mapSpreadsheet(sheets[0], 0, suggestMapping(sheets[0].rows[0]), ",").rows[0]
  ).toMatchObject({ sku: "001", name: "Laço", price: 1050 })
})
test("campos vazios são omitidos, zero e falso são explícitos", () => {
  const sheet = {
    name: "x",
    rows: [
      ["SKU", "Nome", "Preço", "Estoque", "Ativo"],
      ["001", "", "0", "0", "não"],
    ].map((row) => row.map((text) => ({ text }))),
  }
  const result = mapSpreadsheet(sheet, 0, suggestMapping(sheet.rows[0]), ",")
  expect(result.rows[0]).toEqual({
    row: 2,
    sku: "001",
    price: 0,
    stock: 0,
    active: false,
  })
})
test("formato internacional, valores inválidos e estoque fracionado", () => {
  const sheet = {
    name: "x",
    rows: [
      ["SKU", "Preço", "Estoque"],
      ["a", "1,234.56", "1.5"],
      ["b", "1.234,56", "-1"],
    ].map((row) => row.map((text) => ({ text }))),
  }
  const result = mapSpreadsheet(sheet, 0, suggestMapping(sheet.rows[0]), ".")
  expect(result.rows[0].price).toBe(123456)
  expect(result.errors).toHaveLength(3)
})
test("recusa fórmula, data, código sem precisão e coluna duplicada", () => {
  const sheet = {
    name: "x",
    rows: [
      [{ text: "SKU" }, { text: "Preço" }, { text: "Nome" }],
      [
        { text: "1.23E+18", number: 1.23e18 },
        { text: "10", formula: true },
        { text: "2026-01-01", invalid: true },
      ],
    ],
  }
  expect(
    mapSpreadsheet(sheet, 0, suggestMapping(sheet.rows[0]), ",").errors
  ).toHaveLength(3)
  expect(
    mapSpreadsheet(sheet, 0, { sku: 0, barcode: 0 }, ",").errors.some((e) =>
      e.message.includes("apenas um campo")
    )
  ).toBe(true)
})
test("planilha vazia, tipo falso, tamanho e linhas acima do limite", () => {
  expect(() => readSpreadsheet(new ArrayBuffer(0), "vazio.xlsx")).toThrow(
    "vazio"
  )
  expect(() =>
    readSpreadsheet(new TextEncoder().encode("texto").buffer, "falso.xlsx")
  ).toThrow("conteúdo")
  expect(() =>
    readSpreadsheet(new ArrayBuffer(5 * 1024 * 1024 + 1), "grande.csv")
  ).toThrow("5 MB")
  const text =
    "SKU;Nome\n" + Array.from({ length: 530 }, (_, i) => `${i};P`).join("\n")
  expect(() =>
    readSpreadsheet(new TextEncoder().encode(text).buffer, "grande.csv")
  ).toThrow("limite")
})
test("cabeçalhos ambíguos não escolhem uma coluna silenciosamente", () => {
  expect(
    suggestMapping([
      { text: "Nome" },
      { text: "Descrição" },
      { text: "Código" },
    ])
  ).toEqual({})
})
test("exportação de erros neutraliza fórmula e mantém aspas", () => {
  const csv = errorCSV([{ row: 2, message: '=HYPERLINK("evil")' }])
  expect(csv).toContain(`"'=HYPERLINK(""evil"")"`)
})
test("distingue falha de versão de erro de negócio sem repetir a ação", () => {
  expect(
    isStaleDeploymentError(new Error('Failed to find Server Action "old".'))
  ).toBe(true)
  expect(
    isStaleDeploymentError({ name: "ChunkLoadError", message: "missing" })
  ).toBe(true)
  expect(isStaleDeploymentError(new Error("Estoque insuficiente"))).toBe(false)
})

test("bloqueia ZIP com expansão excessiva antes de descompactar", () => {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([["SKU"], ["A"]]),
    "Produtos"
  )
  const buffer = XLSX.write(wb, {
    type: "array",
    bookType: "xlsx",
  }) as ArrayBuffer
  const view = new DataView(buffer)
  for (let i = 0; i < buffer.byteLength - 46; i++)
    if (view.getUint32(i, true) === 0x02014b50) {
      view.setUint32(i + 24, 70 * 1024 * 1024, true)
      break
    }
  expect(() => readSpreadsheet(buffer, "enorme.xlsx")).toThrow("64 MB")
})
