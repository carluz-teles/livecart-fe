"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { LinkSessionMediaPayload, EventPlatform } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface LinkSessionMediaParams {
  eventId: string
  sessionId: string
  payload: LinkSessionMediaPayload
}

/**
 * Vincula a publicação a UMA transmissão nomeada.
 *
 * É o "vincular depois" que a sessão criada sem mídia promete na tela. Não usar
 * `useAddPlatform` para isso: aquela rota resolve a sessão sozinha (a mais
 * recente no ar) e existe para reconectar uma live que caiu — numa campanha com
 * mais de uma transmissão ela vincularia a errada sem avisar.
 */
export function useLinkSessionMedia() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      sessionId,
      payload,
    }: LinkSessionMediaParams): Promise<EventPlatform> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.linkSessionMedia(storeId, eventId, sessionId, payload, token)
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      // O detalhe carrega `platforms` de cada sessão — é dele que sai o badge
      // "Sem publicação vinculada" que acabou de deixar de valer.
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.sessionMetrics(storeId!, eventId) })
    },
  })
}
