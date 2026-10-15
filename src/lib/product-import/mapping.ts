import type {
  ColumnMapping,
  ImportField,
  ImportRow,
  SpreadsheetCell,
  SpreadsheetSheet,
} from "@/types/product-import.types"

export const IMPORT_FIELDS: {
  key: ImportField
  label: string
  aliases: string[]
}[] = [
  {
    key: "keyword",
    label: "Código LiveCart (1000–9999)",
    aliases: ["codigo livecart", "codigo de venda", "keyword"],
  },
  {
    key: "sku",
    label: "SKU / código do fornecedor",
    aliases: ["sku", "referencia", "ref", "codigo fornecedor"],
  },
  {
    key: "name",
    label: "Nome do produto",
    aliases: [
      "nome",
      "produto",
      "nome do produto",
      "descricao",
      "descricao do produto",
      "name",
    ],
  },
  {
    key: "price",
    label: "Preço de venda (R$)",
    aliases: [
      "preco",
      "preco de venda",
      "preco venda",
      "valor",
      "valor unitario",
      "price",
    ],
  },
  {
    key: "stock",
    label: "Estoque disponível (unidades)",
    aliases: [
      "estoque",
      "saldo",
      "quantidade",
      "qtd",
      "stock",
      "estoque disponivel",
    ],
  },
  {
    key: "barcode",
    label: "Código de barras",
    aliases: ["ean", "gtin", "codigo de barras", "barcode"],
  },
  {
    key: "active",
    label: "Produto ativo",
    aliases: ["ativo", "active", "status", "situacao"],
  },
]
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\s]+/g, " ")
    .trim()
}
export function suggestMapping(header: SpreadsheetCell[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  for (const field of IMPORT_FIELDS) {
    const matches = header
      .map((cell, i) => (field.aliases.includes(normalize(cell.text)) ? i : -1))
      .filter((i) => i >= 0)
    if (matches.length === 1) mapping[field.key] = matches[0]
  }
  return mapping
}
export function suggestHeader(sheet: SpreadsheetSheet): number {
  let best = 0,
    count = 0
  sheet.rows.slice(0, 20).forEach((row, index) => {
    const score = Object.keys(suggestMapping(row)).length
    if (score > count) {
      best = index
      count = score
    }
  })
  return best
}
function parseNumber(
  cell: SpreadsheetCell,
  decimal: "," | ".",
  money: boolean
): number {
  if (cell.number !== undefined) {
    if (
      !Number.isFinite(cell.number) ||
      cell.number < 0 ||
      (!money && !Number.isInteger(cell.number))
    )
      throw new Error("Número inválido.")
    const value = money ? Math.round(cell.number * 100) : cell.number
    if (money && Math.abs(cell.number * 100 - value) > 0.00001)
      throw new Error("Preço deve ter no máximo duas casas decimais.")
    if (!Number.isSafeInteger(value)) throw new Error("Número muito grande.")
    return value
  }
  let value = cell.text
    .trim()
    .replace(/^R\$\s*/i, "")
    .replace(/\u00a0/g, " ")
    .trim()
  const pattern =
    decimal === ","
      ? /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/
      : /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/
  if (!pattern.test(value))
    throw new Error("Número inválido. Confira o separador decimal escolhido.")
  value =
    decimal === ","
      ? value.replace(/\./g, "").replace(",", ".")
      : value.replace(/,/g, "")
  const n = Number(value),
    result = money ? Math.round(n * 100) : n
  if (!Number.isSafeInteger(result))
    throw new Error(money ? "Preço muito grande." : "Estoque deve ser inteiro.")
  return result
}
export function mapSpreadsheet(
  sheet: SpreadsheetSheet,
  header: number,
  mapping: ColumnMapping,
  decimal: "," | "."
) {
  const rows: ImportRow[] = [],
    errors: { row: number; message: string }[] = []
  for (let index = header + 1; index < sheet.rows.length; index++) {
    const cells = sheet.rows[index]
    if (cells.every((cell) => !cell.text.trim() && !cell.formula)) continue
    const row: ImportRow = { row: index + 1 }
    for (const field of IMPORT_FIELDS) {
      const col = mapping[field.key]
      if (col === undefined) continue
      const cell = cells[col]
      if (!cell || (!cell.text.trim() && !cell.formula)) continue
      try {
        if (cell.formula)
          throw new Error(
            "Fórmula não importada. Cole o resultado como valor na planilha."
          )
        if (cell.invalid)
          throw new Error("Célula contém data ou erro do Excel.")
        if (field.key === "price" || field.key === "stock")
          row[field.key] = parseNumber(cell, decimal, field.key === "price")
        else if (field.key === "active") {
          const value = normalize(cell.text)
          if (["sim", "true", "1", "ativo", "ativa"].includes(value))
            row.active = true
          else if (["nao", "false", "0", "inativo", "inativa"].includes(value))
            row.active = false
          else throw new Error("Use sim/não, ativo/inativo ou 1/0.")
        } else {
          if (
            ["sku", "barcode", "keyword"].includes(field.key) &&
            cell.number !== undefined &&
            (!Number.isSafeInteger(cell.number) || /e[+-]?\d/i.test(cell.text))
          )
            throw new Error(
              "Código numérico perdeu precisão. Formate a coluna como texto e confira o original."
            )
          row[field.key] = cell.text.trim()
        }
      } catch (error) {
        errors.push({
          row: row.row,
          message: `${field.label}: ${(error as Error).message}`,
        })
      }
    }
    rows.push(row)
  }
  if (rows.length > 500)
    errors.push({ row: 0, message: "Importe no máximo 500 produtos por vez." })
  if (!rows.length)
    errors.push({
      row: 0,
      message: "Nenhuma linha de produto encontrada após o cabeçalho.",
    })
  const columns = Object.values(mapping)
  if (new Set(columns).size !== columns.length)
    errors.push({
      row: 0,
      message: "Cada coluna deve corresponder a apenas um campo.",
    })
  return { rows, errors }
}
export function errorCSV(errors: { row: number; message: string }[]): string {
  const escape = (value: string) =>
    `"${(/^[=+@\-\t\r\n]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`
  return (
    "\ufeffLinha;Erro\r\n" +
    errors.map((error) => `${error.row};${escape(error.message)}`).join("\r\n")
  )
}
