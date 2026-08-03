"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EndSessionResponse } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface EndSessionParams {
  eventId: string
  sessionId: string
}

/**
 * Encerra UMA sessão sem encerrar o evento.
 *
 * Não confundir com `useEndEvent`: aquele encerra o evento, encerra todas as
 * sessões e finaliza os carrinhos. Este para só a live/post que acabou — o
 * evento segue no ar e os carrinhos continuam valendo até a data de fim.
 *
 * Só o detalhe do evento é invalidado. A lista de eventos não muda: o evento
 * continua exatamente com o mesmo status que tinha.
 */
export function useEndSession() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, sessionId }: EndSessionParams): Promise<EndSessionResponse> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.endSession(storeId, eventId, sessionId, token)
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.sessionMetrics(storeId!, eventId) })
    },
  })
}
