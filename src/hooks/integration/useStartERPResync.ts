"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import type { IntegrationListResponse } from "@/types"

export function useStartERPResync() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrationId: string) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      const result = await integrationService.startERPResync(
        storeId,
        integrationId,
        token,
      )
      return { ...result, storeId }
    },
    onSuccess: async ({ products, storeId }, integrationId) => {
      if (storeId) {
        const queryKey = integrationKeys.list(storeId)
        await queryClient.cancelQueries({ queryKey })
        if (products > 0) {
          queryClient.setQueryData<IntegrationListResponse>(
            queryKey,
            (previous) =>
              previous && {
                ...previous,
                data: previous.data.map((integration) =>
                  integration.id === integrationId
                    ? {
                        ...integration,
                        erpResyncRunning: true,
                        erpResyncDone: 0,
                        erpResyncTotal: products,
                      }
                    : integration,
                ),
              },
          )
        }
        await queryClient.invalidateQueries({ queryKey })
      }
      // Zero produtos não é erro: é uma loja que ainda não importou nada desse
      // ERP. Dizer "sincronização iniciada" ali seria mentira educada.
      if (products === 0) {
        toast.info("Nenhum produto vinculado a este ERP para sincronizar")
        return
      }
      toast.success(
        `${products} ${products === 1 ? "produto entrou" : "produtos entraram"} na sincronização`,
        {
          description:
            "Acompanhe o progresso na tela. A lista será atualizada quando o processamento terminar.",
          duration: 8000,
        },
      )
    },
    onError: () => {
      toast.error("Não foi possível iniciar a sincronização")
    },
  })
}
