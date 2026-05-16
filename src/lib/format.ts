/**
 * Centralized formatting utilities for the application.
 * Use these functions instead of inline formatting to ensure consistency.
 */

/**
 * Formats cents to currency string (BRL)
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "R$ 19,90")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

/**
 * Compact currency for axes / chips (e.g., "R$ 1,2k", "R$ 350").
 */
export function formatCompactCurrency(cents: number): string {
  const reais = cents / 100
  if (Math.abs(reais) >= 1_000_000) {
    return `R$ ${(reais / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}M`
  }
  if (Math.abs(reais) >= 1_000) {
    return `R$ ${(reais / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`
  }
  return `R$ ${reais.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
}

/**
 * Formats a date string to localized format
 * @param dateString - ISO date string or null
 * @returns Formatted date string or "-" if null
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("pt-BR")
}

/**
 * Formats a date string to include time
 * @param dateString - ISO date string or null
 * @returns Formatted datetime string or "-" if null
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("pt-BR")
}

/**
 * Formats a date string to time only (HH:mm)
 * @param dateString - ISO date string or null
 * @returns Formatted time string or "-" if null
 */
export function formatTime(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Formats a number to localized format
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

/**
 * Singular/plural Portuguese rendering of a retry-attempt counter.
 * @param count - integer attempts count, expected >= 0
 * @returns e.g. "1 tentativa" / "3 tentativas"
 */
export function formatAttemptCount(count: number): string {
  return count === 1 ? "1 tentativa" : `${count} tentativas`
}

/**
 * Formats a Brazilian phone number for display. Accepts any input shape
 * (with/without country code, with mask, with spaces) and returns either
 * "(11) 99999-9999", "(11) 9999-9999" or the original cleaned string.
 */
export function formatPhoneBR(raw: string | null | undefined): string {
  if (!raw) return ""
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 10) return raw

  const withoutCountry = digits.startsWith("55") && digits.length > 11
    ? digits.slice(2)
    : digits

  if (withoutCountry.length === 11) {
    return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`
  }
  if (withoutCountry.length === 10) {
    return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 6)}-${withoutCountry.slice(6)}`
  }
  return raw
}

/**
 * Returns the E.164-ish digits that can follow `https://wa.me/`. Prepends 55
 * when the input is a 10/11-digit BR phone without country code.
 */
export function toWhatsAppDigits(raw: string | null | undefined): string {
  if (!raw) return ""
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits
}

/**
 * Formats a Brazilian CPF or CNPJ for display. CPF = 11 digits, CNPJ = 14.
 */
export function formatDocument(raw: string | null | undefined): string {
  if (!raw) return ""
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  }
  return raw
}

/**
 * Formats a CEP / postal code as "00000-000". Falls back to raw when length
 * isn't 8 digits.
 */
export function formatZipBR(raw: string | null | undefined): string {
  if (!raw) return ""
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 8) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return raw
}

/**
 * Parses currency string to cents
 * @param value - Currency string (e.g., "19,90" or "R$ 19,90")
 * @returns Amount in cents
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".")
  return Math.round(parseFloat(cleaned) * 100) || 0
}

/**
 * Formats grams with automatic kg conversion when >= 1000
 * @param grams - weight in grams
 * @returns e.g. "150 g" or "1,5 kg"
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000
    return `${kg.toString().replace(".", ",")} kg`
  }
  return `${grams} g`
}

/**
 * Formats package dimensions as "H × W × L cm"
 */
export function formatDimensions(
  heightCm: number,
  widthCm: number,
  lengthCm: number
): string {
  return `${heightCm} × ${widthCm} × ${lengthCm} cm`
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "agora"
  if (diffMins < 60) return `${diffMins} min atras`
  if (diffHours < 24) return `${diffHours}h atras`
  if (diffDays < 7) return `${diffDays}d atras`
  return formatDate(dateString)
}

/**
 * Returns up to two uppercase initials from a name (e.g., "Ana Silva" → "AS").
 * Falls back to "?" when the input has no usable letters.
 */
export function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  )
}

/**
 * Formats a relative date (e.g., "Hoje", "Ontem", "3 dias atras")
 * @param dateString - ISO date string
 * @returns Relative date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `${diffDays} dias atras`
  return formatDate(dateString)
}
