// =============================================================================
// CATALOGS — named, reusable collections of products
//
// A catalog is a named set of products (e.g. "Catálogo de Páscoa") that can be
// reused across many events. Association is 1 catalog → N events; each event
// has at most one catalog.
// =============================================================================

// List item — slim summary used in the catalogs table.
export interface Catalog {
  id: string
  name: string
  productCount: number
  createdAt: string
  updatedAt: string
}

// A product as it appears inside a catalog's detail response. `price` is in
// cents; `code` is the product keyword (its "código da live"). `position`
// drives display order — frontend respects whatever the backend sent.
export interface CatalogProduct {
  id: string
  name: string
  code: string
  price: number // price in cents
  imageUrl: string | null
  stock: number
  position: number
}

// Detail response — full graph (products embedded, ordered by position).
export interface CatalogDetail {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  products: CatalogProduct[]
}

export interface CreateCatalogPayload {
  name: string
  productIds?: string[]
}

export interface UpdateCatalogPayload {
  name: string
}

// Body for PUT /catalogs/:id/products — full replace; array order = display
// order.
export interface SetCatalogProductsPayload {
  productIds: string[]
}

// Body for PUT /lives/:id/catalog — null clears the association.
export interface SetEventCatalogPayload {
  catalogId: string | null
}

// Response of PUT /lives/:id/catalog.
export interface EventCatalogLink {
  eventId: string
  catalogId: string | null
}
