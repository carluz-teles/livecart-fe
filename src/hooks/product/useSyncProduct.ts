"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { useIntegrations } from "@/hooks/integration"
import { productKeys } from "./useProducts"
import type { Product } from "@/types/product.types"
import type { Integration } from "@/types/integration.types"

interface SyncProductParams {
  product: Product
}

function findERPIntegration(
  integrations: Integration[],
  externalSource: string
): Integration | undefined {
  return integrations.find(
    (i) => i.type === "erp" && i.provider === externalSource && i.status === "active"
  )
}

export function useSyncProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()
  const { data: integrationsData } = useIntegrations()

  const integrations = integrationsData?.data ?? []

  return {
    ...useMutation({
      mutationFn: async ({ product }: SyncProductParams): Promise<Product> => {
        if (!storeId) throw new Error("Store ID is required")
        if (!product.externalId) {
          throw new Error("Produto não possui ID externo vinculado a um ERP")
        }

        const integration = findERPIntegration(integrations, product.externalSource)
        if (!integration) {
          throw new Error(
            `Nenhuma integração ${product.externalSource} ativa encontrada`
          )
        }

        const token = await getToken()
        return integrationService.syncProduct(
          storeId,
          integration.id,
          product.id,
          token
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      },
    }),
    canSync: (product: Product) =>
      !!product.externalId &&
      product.externalSource !== "manual" &&
      !!findERPIntegration(integrations, product.externalSource),
  }
}
