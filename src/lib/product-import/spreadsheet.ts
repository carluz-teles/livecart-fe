import * as XLSX from "xlsx"
import { checkWorkbookZipSize } from "./zip-limit"
import type { SpreadsheetSheet } from "@/types/product-import.types"

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_ROWS = 500
const MAX_HEADER_ROWS = 20
const MAX_COLUMNS = 60

export function readSpreadsheet(
  buffer: ArrayBuffer,
  filename: string,
  delimiter = "",
  encoding = "utf-8"
): SpreadsheetSheet[] {
  if (!/\.(xlsx|xls|csv)$/i.test(filename))
    throw new Error("Use um arquivo .xlsx, .xls ou .csv.")
  if (buffer.byteLength > MAX_FILE_BYTES)
    throw new Error("O arquivo deve ter no máximo 5 MB.")
  if (!buffer.byteLength) throw new Error("O arquivo está vazio.")
  checkWorkbookZipSize(buffer)
  const csv = /\.csv$/i.test(filename)
  const bytes = new Uint8Array(buffer)
  if (
    !csv &&
    !(
      (bytes[0] === 0x50 && bytes[1] === 0x4b) ||
      (bytes[0] === 0xd0 && bytes[1] === 0xcf) ||
      (bytes[0] === 0x09 && [0, 2, 4, 8].includes(bytes[1]))
    )
  ) {
    throw new Error(
      "O conteúdo não corresponde a um arquivo Excel. Exporte como .xlsx ou CSV."
    )
  }
  const data = csv
    ? new TextDecoder(encoding, { fatal: true }).decode(buffer)
    : buffer
  const options: XLSX.ParsingOptions = {
    type: csv ? "string" : "array",
    raw: true,
    cellDates: true,
    cellHTML: false,
    cellFormula: true,
    sheetRows: MAX_ROWS + MAX_HEADER_ROWS + 2,
    ...(delimiter ? { FS: delimiter } : {}),
  }
  const metadata = XLSX.read(data, { ...options, bookSheets: true })
  if (metadata.SheetNames.length > 20)
    throw new Error("Use um arquivo com até 20 abas.")
  const workbook = XLSX.read(data, options)
  const sheets: SpreadsheetSheet[] = []
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name]
    if (!sheet?.["!ref"]) continue
    const range = XLSX.utils.decode_range(sheet["!fullref"] || sheet["!ref"]!)
    if (
      range.e.r >= MAX_ROWS + MAX_HEADER_ROWS + 1 ||
      range.e.c >= MAX_COLUMNS
    ) {
      throw new Error(
        `A aba “${name}” excede o limite de 500 produtos, 20 linhas de cabeçalho ou 60 colunas. Divida o arquivo em lotes menores.`
      )
    }
    const rows: SpreadsheetSheet["rows"] = []
    // Keep actual row/column coordinates, including leading blank rows.
    for (let r = 0; r <= range.e.r; r++) {
      const row: SpreadsheetSheet["rows"][number] = []
      for (let c = 0; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })] as
          XLSX.CellObject | undefined
        const text = cell ? String(cell.w ?? cell.v ?? "") : ""
        if (text.length > 2000)
          throw new Error(
            `A célula ${XLSX.utils.encode_cell({ r, c })} da aba “${name}” é muito longa.`
          )
        row.push({
          text,
          ...(cell?.t === "n" ? { number: cell.v as number } : {}),
          ...(cell?.f ? { formula: true } : {}),
          ...(cell && ["e", "d"].includes(cell.t) ? { invalid: true } : {}),
        })
      }
      rows.push(row)
    }
    sheets.push({ name, rows })
  }
  if (!sheets.length) throw new Error("Nenhuma aba com dados foi encontrada.")
  return sheets
}
