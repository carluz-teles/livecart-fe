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
 * Parses currency string to cents
 * @param value - Currency string (e.g., "19,90" or "R$ 19,90")
 * @returns Amount in cents
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".")
  return Math.round(parseFloat(cleaned) * 100) || 0
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
