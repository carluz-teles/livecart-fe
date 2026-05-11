"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"

interface UpdatePriorityArgs {
  integrationId: string
  priority: number
}

export function useUpdateIntegrationPriority() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ integrationId, priority }: UpdatePriorityArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.updatePriority(storeId, integrationId, priority, token)
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: integrationKeys.list(storeId) })
      }
    },
    onError: () => {
      toast.error("Não foi possível atualizar a prioridade")
    },
  })
}
