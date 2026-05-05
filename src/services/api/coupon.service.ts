import { apiClient } from "./client"
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types"

const path = (storeId: string, eventId: string, suffix = "") =>
  `/stores/${storeId}/events/${eventId}/coupons${suffix}`

export const couponService = {
  list: (storeId: string, eventId: string, token?: string | null) =>
    apiClient.get<Coupon[]>(path(storeId, eventId), token),

  create: (
    storeId: string,
    eventId: string,
    payload: CreateCouponPayload,
    token?: string | null,
  ) => apiClient.post<Coupon>(path(storeId, eventId), payload, token),

  update: (
    storeId: string,
    eventId: string,
    couponId: string,
    payload: UpdateCouponPayload,
    token?: string | null,
  ) =>
    apiClient.patch<Coupon>(path(storeId, eventId, `/${couponId}`), payload, token),

  delete: (
    storeId: string,
    eventId: string,
    couponId: string,
    token?: string | null,
  ) => apiClient.delete<void>(path(storeId, eventId, `/${couponId}`), token),
}
