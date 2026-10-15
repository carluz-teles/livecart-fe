export type ImportField =
  "keyword" | "sku" | "name" | "price" | "stock" | "barcode" | "active"
export interface ImportRow {
  row: number
  keyword?: string
  sku?: string
  name?: string
  price?: number
  stock?: number
  barcode?: string
  active?: boolean
}
export interface ImportRequest {
  matchBy: "keyword" | "sku"
  rows: ImportRow[]
  revision?: string
}
export interface ImportResultRow {
  row: number
  action: "create" | "update" | "invalid"
  keyword: string
  name: string
  price: number
  stock: number
  errors: string[]
  warnings: string[]
}
export interface ImportResponse {
  rows: ImportResultRow[]
  created: number
  updated: number
  invalid: number
  revision: string
  applied: boolean
}
export interface SpreadsheetCell {
  text: string
  number?: number
  formula?: boolean
  invalid?: boolean
}
export interface SpreadsheetSheet {
  name: string
  rows: SpreadsheetCell[][]
}
export type ColumnMapping = Partial<Record<ImportField, number>>
