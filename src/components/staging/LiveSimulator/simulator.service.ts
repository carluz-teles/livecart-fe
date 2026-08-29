import { apiClient } from "@/services/api/client"

/**
 * Simulador de live — as rotas SÓ EXISTEM em staging.
 *
 * Fora de staging o backend não as registra, então qualquer chamada volta 404.
 * O gate visual do painel é conveniência; a porta trancada é a de lá.
 */
export interface SessaoSimulavel {
  sessionId: string
  status: string
  eventId: string
  eventTitle: string
  startedAt?: string
  midiasVivas: string[]
}

export interface ComentarioSimuladoResult {
  entregues: string[]
  mediaId: string
  handle: string
  userId: string
  falhas?: string[]
}

export interface SessaoNoAr {
  eventId: string
  sessionId: string
  mediaId: string
}

const base = (storeId: string) => `/stores/${storeId}/simulador/live`

export const simulatorService = {
  /**
   * Abre uma transmissão num evento que JÁ EXISTE e a põe no ar.
   *
   * A campanha continua sendo criada no painel de verdade — o que não dá para
   * fazer em staging é ENTRAR NO AR, porque a tela exige escolher uma live ativa
   * do Instagram e a conta de teste não transmite.
   */
  entrarNoAr: (storeId: string, eventId: string, mediaId: string, token?: string | null) =>
    apiClient.post<SessaoNoAr>(`${base(storeId)}/sessao`, { eventId, mediaId }, token),

  listarSessoes: (storeId: string, token?: string | null) =>
    apiClient.get<SessaoSimulavel[]>(`${base(storeId)}/sessoes`, token),

  criarMidia: (storeId: string, sessionId: string, mediaId: string, token?: string | null) =>
    apiClient.post<{ mediaId: string; sessionId: string }>(
      `${base(storeId)}/midia`,
      { sessionId, mediaId },
      token,
    ),

  encerrarMidia: (storeId: string, mediaId: string, token?: string | null) =>
    apiClient.delete<{ mediaId: string; released: boolean }>(
      `${base(storeId)}/midia/${encodeURIComponent(mediaId)}`,
      token,
    ),

  comentar: (
    storeId: string,
    body: { mediaId: string; handle: string; userId?: string; text: string; vezes: number },
    token?: string | null,
  ) => apiClient.post<ComentarioSimuladoResult>(`${base(storeId)}/comentario`, body, token),
}
