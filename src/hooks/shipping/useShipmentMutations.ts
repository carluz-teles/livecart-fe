"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { shippingService } from "@/services/api/shipping.service"
import { useStoreId } from "@/hooks/useUser"
import { orderKeys } from "@/hooks/order"
import type {
  IntegrationProvider,
  CreateShipmentPayload,
  AttachInvoicePayload,
  GenerateLabelsPayload,
  TrackingLookupPayload,
} from "@/types"

interface WithProvider<T> {
  provider: IntegrationProvider
  payload: T
}

export function useCreateShipment(orderId?: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ provider, payload }: WithProvider<CreateShipmentPayload>) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return shippingService.createShipment(storeId, provider, payload, token)
    },
    onSuccess: () => {
      if (orderId && storeId) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(storeId, orderId),
        })
      }
    },
  })
}

interface AttachInvoiceArgs {
  provider: IntegrationProvider
  shipmentId: string
  payload: AttachInvoicePayload
}

export function useAttachInvoice(orderId?: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ provider, shipmentId, payload }: AttachInvoiceArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return shippingService.attachInvoice(
        storeId,
        provider,
        shipmentId,
        payload,
        token
      )
    },
    onSuccess: () => {
      if (orderId && storeId) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(storeId, orderId),
        })
      }
    },
  })
}

interface UploadInvoiceXmlArgs {
  provider: IntegrationProvider
  shipmentId: string
  file: File
}

export function useUploadInvoiceXml(orderId?: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ provider, shipmentId, file }: UploadInvoiceXmlArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return shippingService.uploadInvoiceXml(
        storeId,
        provider,
        shipmentId,
        file,
        token
      )
    },
    onSuccess: () => {
      if (orderId && storeId) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(storeId, orderId),
        })
      }
    },
  })
}

export function useGenerateLabels() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async ({ provider, payload }: WithProvider<GenerateLabelsPayload>) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return shippingService.generateLabels(storeId, provider, payload, token)
    },
  })
}

export function useFetchTracking() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useMutation({
    mutationFn: async ({ provider, payload }: WithProvider<TrackingLookupPayload>) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return shippingService.getTracking(storeId, provider, payload, token)
    },
  })
}
