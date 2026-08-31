import { apiClient } from "./client"

/**
 * A single product in the public live catalog.
 * `price` is in cents; `imageUrl` may be empty (render placeholder).
 * `code` is the live keyword shown as "Código da live".
 */
export interface PublicCatalogProduct {
  id: string
  name: string
  code: string
  price: number
  imageUrl: string
  stock: number
  position: number
}

/**
 * The public catalog for a live event (no authentication required).
 */
export interface PublicCatalog {
  id: string
  name: string
  products: PublicCatalogProduct[]
}

/**
 * Service for the public live catalog API (no authentication required).
 */
export const publicCatalogService = {
  /**
   * Fetch the public catalog for a live event by its id.
   */
  getByEventId: (eventId: string) =>
    apiClient.publicGet<PublicCatalog>(`/api/public/events/${eventId}/catalog`),
}
