"use client"

import { useIntegrations } from "./useIntegrations"
import type { Integration, IntegrationProvider } from "@/types"

/**
 * Nomes de vitrine dos ERPs.
 *
 * Vivem aqui, e não na página de Integrações, porque quem precisa deles não é
 * só ela: a tela de Pedidos escrevia "Tiny" cravado no texto de juntar pedidos
 * e mentia para toda loja Bling — o lojista lia "Juntar no Tiny" num ERP que
 * não é o dele.
 */
const NOMES: Record<string, string> = {
  tiny: "Tiny",
  bling: "Bling",
}

export type ERPConectado = {
  /** A integração de ERP ativa, se houver. */
  integracao?: Integration
  /** "Tiny", "Bling" — ou "seu ERP" quando ainda não deu para saber. */
  nome: string
  provider?: IntegrationProvider
  /** Falso enquanto a lista de integrações não chegou. */
  carregado: boolean
}

/**
 * Qual ERP esta loja usa.
 *
 * Uma loja integra UM ERP por vez (o banco garante, via
 * uniq_integrations_store_one_erp), então "o ERP da loja" é uma pergunta com
 * resposta única — e é por isso que dá para escrever o nome dele no meio de uma
 * frase sem qualificar nada.
 *
 * O fallback é "seu ERP", não "Tiny": um texto genérico nunca mente, e o nome
 * errado mente sempre.
 */
export function useERPConectado(): ERPConectado {
  const { data, isLoading } = useIntegrations()

  const integracao = data?.data?.find(
    (i: Integration) => i.type === "erp" && i.status === "active"
  )

  return {
    integracao,
    provider: integracao?.provider,
    nome: (integracao && NOMES[integracao.provider]) || "seu ERP",
    carregado: !isLoading && Boolean(data?.data),
  }
}
