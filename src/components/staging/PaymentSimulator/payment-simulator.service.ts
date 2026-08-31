import { apiClient } from "@/services/api/client"

/**
 * Simulador de pagamentos — as rotas SÓ EXISTEM em staging.
 *
 * Fora de staging o backend não as registra, então qualquer chamada volta 404.
 * O gate visual do painel é conveniência; a porta trancada é a de lá.
 */

export interface CarrinhoPagavel {
  cartId: string
  shortId: number
  handle: string
  eventId: string
  eventTitle: string
  itens: number
  subtotalCents: number
  shippingCents: number
  cupomCodigo?: string
  cupomDescontoCents: number
  /** O percentual configurado no evento. A simulação pode sobrepô-lo. */
  pixPercentDoEvento: number
  criadoEm: string
}

export interface CupomDoEvento {
  codigo: string
  tipo: string
  percentBps?: number
  valorCents?: number
  eventId: string
}

export interface CarrinhosPagaveis {
  carrinhos: CarrinhoPagavel[]
  cupons: CupomDoEvento[]
}

/** A conta que foi cobrada, aberta — para conferir de onde saiu o número. */
export interface CobrancaSimulada {
  cartId: string
  paymentId: string
  metodo: string
  subtotalCents: number
  cupomCodigo?: string
  cupomDescontoCents: number
  pixDescontoPercent: number
  pixDescontoCents: number
  shippingCents: number
  cobradoCents: number
}

export interface PagarBody {
  cartId: string
  metodo: "pix" | "credit_card"
  /** Vazio = não mexe no cupom que o carrinho já tenha. */
  cupomCodigo?: string
  /** -1 = usa o percentual do evento. */
  pixDescontoPercent: number
  parcelas: number
}

const base = (storeId: string) => `/stores/${storeId}/simulador/pagamento`

export const paymentSimulatorService = {
  listarCarrinhos: (storeId: string, token?: string | null) =>
    apiClient.get<CarrinhosPagaveis>(`${base(storeId)}/carrinhos`, token),

  pagar: (storeId: string, body: PagarBody, token?: string | null) =>
    apiClient.post<CobrancaSimulada>(`${base(storeId)}/pagar`, body, token),
}
