"use client"

import { useCallback, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { DrainReport } from "@/types"

import { integrationKeys } from "./useIntegrations"

export const drenagemKeys = {
  all: [...integrationKeys.all, "drenagem"] as const,
  pendente: (storeId: string) => [...drenagemKeys.all, storeId] as const,
}

/**
 * Quanto ainda falta drenar. É o ensaio do backend (`dryRun`), que não escreve
 * nada e devolve o trabalho TOTAL pendente.
 *
 * É ele que decide se o painel aparece: quando a resposta vem com zero
 * carrinhos, a migração acabou e a tela some sozinha. Um painel de migração que
 * precisa de um segundo deploy para sair fica esquecido em produção.
 */
export function useDrenagemPendente({ enabled = true }: { enabled?: boolean } = {}) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: drenagemKeys.pendente(storeId ?? ""),
    queryFn: async (): Promise<DrainReport> => {
      const token = await getToken()
      return integrationService.drainLegacyReservations(storeId!, { dryRun: true }, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

/** Uma passada só. Escreve no ERP e não tem volta. */
export function useDrenar() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (limit: number): Promise<DrainReport> => {
      const token = await getToken()
      return integrationService.drainLegacyReservations(storeId!, { dryRun: false, limit }, token)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: drenagemKeys.all })
    },
  })
}

/**
 * O teto de cada passada é de TEMPO, não de carrinhos.
 *
 * O custo de um carrinho varia demais para um número fixo servir: no ensaio
 * eram 16 segundos, e na cantodaart — 150 produtos disputando a mesma cota e o
 * Tiny devolvendo 429 — um lote de 5 passou de sete minutos e nenhum navegador
 * esperou. O servidor corta em 45 segundos e devolve o que fez; o limite por
 * carrinhos fica alto só como rede de segurança.
 */
const SEGUNDOS_POR_LOTE = 45
const CARRINHOS_POR_LOTE = 25

export interface ProgressoDrenagem {
  rodando: boolean
  total: number
  feitos: number
  lote: number
  erro: string | null
  ultimo: DrainReport | null
}

/**
 * A migração inteira, em lotes, com a tela acompanhando.
 *
 * Uma passada única dos 87 carrinhos leva 23 minutos — medido no ensaio de
 * 29/08. Numa requisição só isso não sobrevive: o navegador desiste, o proxy
 * corta, e o lojista fica olhando um botão travado sem saber se pode clicar de
 * novo. Pior: o SERVIDOR continua trabalhando depois de o cliente cair (foi o
 * que aconteceu no ensaio), então um segundo clique dispara uma drenagem
 * concorrente — o CAS impede estorno duplo, mas dobra o ritmo de escrita e
 * estoura o teto da conta.
 *
 * Em lotes, cada requisição dura ~80 segundos, a barra anda entre elas e parar
 * é seguro em qualquer ponto: a passada seguinte continua de onde esta ficou.
 *
 * ═══ POR QUE UM ERRO NÃO ENCERRA NA HORA ═══
 *
 * Quando a requisição morre por tempo, o servidor NÃO para. Tratar isso como
 * falha faria a tela mentir e o lojista repetir trabalho que já estava sendo
 * feito. Por isso, ao errar, o loop primeiro relê quanto falta: se o número
 * andou, foi só o cliente que caiu, e ele continua. Só um erro que não move o
 * ponteiro é uma falha de verdade.
 */
export function useDrenarTudo() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const qc = useQueryClient()
  const pararRef = useRef(false)
  const [progresso, setProgresso] = useState<ProgressoDrenagem>({
    rodando: false, total: 0, feitos: 0, lote: 0, erro: null, ultimo: null,
  })

  const quantoFalta = useCallback(async (): Promise<number> => {
    const token = await getToken()
    const r = await integrationService.drainLegacyReservations(storeId!, { dryRun: true }, token)
    return r.carts
  }, [getToken, storeId])

  const parar = useCallback(() => {
    pararRef.current = true
  }, [])

  const rodar = useCallback(async () => {
    pararRef.current = false
    let total = 0
    try {
      total = await quantoFalta()
    } catch (e) {
      setProgresso((p) => ({ ...p, erro: e instanceof Error ? e.message : "não consegui ler quanto falta" }))
      return
    }
    setProgresso({ rodando: true, total, feitos: 0, lote: 0, erro: null, ultimo: null })

    let restam = total
    let lote = 0
    while (restam > 0 && !pararRef.current) {
      lote += 1
      try {
        const token = await getToken()
        const r = await integrationService.drainLegacyReservations(
          storeId!,
          { dryRun: false, limit: CARRINHOS_POR_LOTE, maxSeconds: SEGUNDOS_POR_LOTE },
          token,
        )
        if (r.alreadyRunning) {
          // Outra aba está drenando. Encostar aqui só desperdiçaria cota.
          setProgresso((p) => ({
            ...p, rodando: false,
            erro: "já há uma migração em andamento — provavelmente em outra aba",
          }))
          break
        }
        // `carts` na resposta é o pendente ANTES desta passada — o backend o
        // calcula percorrendo a lista inteira antes de aplicar o limite. Lê-lo
        // como "quanto falta" deixaria a barra parada e o laço girando: o
        // número não anda nunca. Quem falta é o ensaio, relido agora; quem
        // andou é `outcomes`, que tem uma entrada por carrinho PROCESSADO.
        const feitosNoLote = r.outcomes?.length ?? 0
        restam = await quantoFalta()
        setProgresso({
          rodando: true, total, feitos: total - restam, lote, erro: null, ultimo: r,
        })
        if (feitosNoLote === 0 && r.failed === 0) {
          // Nada processado e nada falhou: a lista acabou, ou algo a filtrou
          // toda. Parar é melhor do que girar.
          break
        }
        if (r.failed > 0) {
          // Cada falha é um carrinho que ficou com a reserva antiga intacta.
          // Parar aqui é a escolha certa: recuperável enquanto forem poucas.
          setProgresso((p) => ({
            ...p, rodando: false,
            erro: `${r.failed} carrinho(s) falharam nesta passada — pare e olhe o log antes de continuar`,
          }))
          break
        }
      } catch (e) {
        // O cliente pode ter caído com o servidor ainda trabalhando. Relê antes
        // de acusar falha.
        let agora = restam
        try {
          agora = await quantoFalta()
        } catch {
          // segue com o valor anterior
        }
        if (agora < restam) {
          restam = agora
          setProgresso({ rodando: true, total, feitos: total - restam, lote, erro: null, ultimo: null })
          continue
        }
        setProgresso((p) => ({
          ...p, rodando: false,
          erro: e instanceof Error ? e.message : "a passada falhou",
        }))
        break
      }
    }

    setProgresso((p) => ({ ...p, rodando: false }))
    void qc.invalidateQueries({ queryKey: drenagemKeys.all })
  }, [getToken, qc, quantoFalta, storeId])

  return { progresso, rodar, parar }
}
