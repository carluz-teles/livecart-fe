import type { Pagination, Sorting } from "@/types/api.types"

/**
 * Builds a query string from pagination, sorting, search, and filter params
 */
export function buildQueryString(params: {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>
}): string {
  const searchParams = new URLSearchParams()

  // Add search
  if (params.search) {
    searchParams.set("search", params.search)
  }

  // Add pagination
  if (params.pagination) {
    if (params.pagination.page > 1) {
      searchParams.set("page", String(params.pagination.page))
    }
    if (params.pagination.limit !== 20) {
      searchParams.set("limit", String(params.pagination.limit))
    }
  }

  // Add sorting
  if (params.sorting) {
    if (params.sorting.sortBy !== "createdAt") {
      searchParams.set("sortBy", params.sorting.sortBy)
    }
    if (params.sorting.sortOrder !== "desc") {
      searchParams.set("sortOrder", params.sorting.sortOrder)
    }
  }

  // Add filters
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value === undefined || value === null) continue

      if (Array.isArray(value)) {
        // For array values (like status[]=active&status[]=inactive), add each value separately
        for (const item of value) {
          searchParams.append(key, String(item))
        }
      } else if (typeof value === "boolean") {
        if (value) {
          searchParams.set(key, "true")
        }
      } else if (typeof value === "number" || typeof value === "string") {
        if (value !== "") {
          searchParams.set(key, String(value))
        }
      }
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

/**
 * Parses pagination from URL search params
 */
export function parsePagination(searchParams: URLSearchParams): Pagination {
  return {
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  }
}

/**
 * Parses sorting from URL search params
 */
export function parseSorting(
  searchParams: URLSearchParams,
  defaultSortBy = "createdAt"
): Sorting {
  return {
    sortBy: searchParams.get("sortBy") || defaultSortBy,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  }
}

/**
 * Formats cents to currency string (BRL)
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

/**
 * Parses currency string to cents
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".")
  return Math.round(parseFloat(cleaned) * 100) || 0
}
