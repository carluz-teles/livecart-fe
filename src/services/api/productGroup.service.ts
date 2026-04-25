import { apiClient } from "./client"
import type {
  ProductGroupListResponse,
  ProductGroupDetail,
  ProductGroupListParams,
  ProductGroupImage,
  CreateProductGroupPayload,
  CreateProductGroupResponse,
  UpdateProductGroupPayload,
  AddProductGroupImagePayload,
} from "@/types"

function toQueryString(params?: ProductGroupListParams): string {
  if (!params) return ""
  const search = new URLSearchParams()
  if (params.search) search.set("search", params.search)
  if (params.pagination?.page) search.set("page", String(params.pagination.page))
  if (params.pagination?.limit) search.set("limit", String(params.pagination.limit))
  if (params.sorting?.sortBy) search.set("sortBy", params.sorting.sortBy)
  if (params.sorting?.sortOrder) search.set("sortOrder", params.sorting.sortOrder)
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export const productGroupService = {
  list: (
    storeId: string,
    params?: ProductGroupListParams,
    token?: string | null
  ) =>
    apiClient.get<ProductGroupListResponse>(
      `/stores/${storeId}/product-groups${toQueryString(params)}`,
      token
    ),

  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<ProductGroupDetail>(
      `/stores/${storeId}/product-groups/${id}`,
      token
    ),

  // Atomic — group + options + values + N variants in one call. Anything
  // failing rolls the whole thing back.
  create: (
    storeId: string,
    payload: CreateProductGroupPayload,
    token?: string | null
  ) =>
    apiClient.post<CreateProductGroupResponse>(
      `/stores/${storeId}/product-groups`,
      payload,
      token
    ),

  update: (
    storeId: string,
    id: string,
    payload: UpdateProductGroupPayload,
    token?: string | null
  ) =>
    apiClient.put<ProductGroupDetail>(
      `/stores/${storeId}/product-groups/${id}`,
      payload,
      token
    ),

  // Deleting a group orphans its variants (groupId → null), it does not delete
  // them. Useful to know if you're cleaning up — removing a typo'd group is
  // safe; the variants stay alive as plain products.
  delete: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(
      `/stores/${storeId}/product-groups/${id}`,
      token
    ),

  addImage: (
    storeId: string,
    groupId: string,
    payload: AddProductGroupImagePayload,
    token?: string | null
  ) =>
    apiClient.post<ProductGroupImage>(
      `/stores/${storeId}/product-groups/${groupId}/images`,
      payload,
      token
    ),

  removeImage: (
    storeId: string,
    groupId: string,
    imageId: string,
    token?: string | null
  ) =>
    apiClient.delete<void>(
      `/stores/${storeId}/product-groups/${groupId}/images/${imageId}`,
      token
    ),
}
