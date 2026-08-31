// Shared BRL price-mask helpers. The stored value is always an integer number
// of CENTS. Display is derived from cents via a cents-accumulator mask: the
// user just types digits and the comma/thousands separators are inserted
// automatically (e.g. "1","5","0","0","0","0" → "150,00").

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// 15000 → "150,00", 150000 → "1.500,00", 1 → "0,01", 0 → "".
export function formatCentsBRL(cents: number): string {
  if (!cents || Number.isNaN(cents)) return ""
  return brlFormatter.format(cents / 100)
}

// Strips everything non-digit and parses the remaining digits as integer cents.
export function digitsToCents(raw: string): number {
  const digits = raw.replace(/\D/g, "")
  return parseInt(digits || "0", 10)
}
