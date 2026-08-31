import { apiClient } from "./client"
import type {
  Catalog,
  CatalogDetail,
  CatalogProduct,
  CreateCatalogPayload,
  UpdateCatalogPayload,
  EventCatalogLink,
} from "@/types"

export const catalogService = {
  // List catalogs (slim summaries with product count).
  list: (storeId: string, token?: string | null) =>
    apiClient.get<Catalog[]>(`/stores/${storeId}/catalogs`, token),

  // Get a catalog with its ordered products.
  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<CatalogDetail>(`/stores/${storeId}/catalogs/${id}`, token),

  // Create a catalog, optionally seeding it with products.
  create: (storeId: string, payload: CreateCatalogPayload, token?: string | null) =>
    apiClient.post<Catalog>(`/stores/${storeId}/catalogs`, payload, token),

  // Rename a catalog.
  update: (storeId: string, id: string, payload: UpdateCatalogPayload, token?: string | null) =>
    apiClient.put<Catalog>(`/stores/${storeId}/catalogs/${id}`, payload, token),

  // Delete a catalog.
  remove: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/catalogs/${id}`, token),

  // Full replace of a catalog's products. Array order = display order.
  setProducts: (storeId: string, id: string, productIds: string[], token?: string | null) =>
    apiClient.put<CatalogProduct[]>(
      `/stores/${storeId}/catalogs/${id}/products`,
      { productIds },
      token
    ),

  // Read an event's associated catalog. Backend returns 404 when the event has
  // no catalog — callers should treat that as "Nenhum".
  getEventCatalog: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<CatalogDetail>(`/stores/${storeId}/lives/${eventId}/catalog`, token),

  // Associate (or clear, with null) a catalog to an event.
  setEventCatalog: (
    storeId: string,
    eventId: string,
    catalogId: string | null,
    token?: string | null
  ) =>
    apiClient.put<EventCatalogLink>(
      `/stores/${storeId}/lives/${eventId}/catalog`,
      { catalogId },
      token
    ),
}
