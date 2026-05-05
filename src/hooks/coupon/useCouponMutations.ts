"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import { useStoreId } from "@/hooks/useUser"
import { couponService } from "@/services/api/coupon.service"
import type { CreateCouponPayload, UpdateCouponPayload } from "@/types"
import { couponKeys } from "./useCoupons"

export function useCreateCoupon(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCouponPayload) => {
      const token = await getToken()
      return couponService.create(storeId!, eventId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: couponKeys.list(storeId ?? "", eventId),
      })
      toast.success("Cupom criado")
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Erro ao criar cupom")
    },
  })
}

export function useUpdateCoupon(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      couponId,
      payload,
    }: {
      couponId: string
      payload: UpdateCouponPayload
    }) => {
      const token = await getToken()
      return couponService.update(storeId!, eventId, couponId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: couponKeys.list(storeId ?? "", eventId),
      })
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Erro ao atualizar cupom")
    },
  })
}

export function useDeleteCoupon(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (couponId: string) => {
      const token = await getToken()
      return couponService.delete(storeId!, eventId, couponId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: couponKeys.list(storeId ?? "", eventId),
      })
      toast.success("Cupom removido")
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Erro ao remover cupom")
    },
  })
}
