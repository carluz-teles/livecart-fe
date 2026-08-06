"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventSessionMetrics } from "@/types/event.types"
import { eventKeys } from "./useEvents"

/** Métrica em dois níveis do evento (Fatia 5).
 *
 *  A quebra por transmissão também viaja dentro de cada `EventSession` do
 *  detalhe do evento. Este hook existe para o que NÃO cabe lá: o balde "sem
 *  transmissão" e os totais do evento — sem eles a soma exibida não fecha, e a
 *  primeira coisa que o lojista faz é somar as linhas na mão. */
export function useSessionMetrics(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.sessionMetrics(storeId ?? "", eventId),
    queryFn: async (): Promise<EventSessionMetrics> => {
      const token = await getToken()
      return eventService.getSessionMetrics(storeId!, eventId, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
