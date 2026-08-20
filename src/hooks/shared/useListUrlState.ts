"use client"

import { useEffect } from "react"
import { useState } from "react"

/**
 * Estado de listagem espelhado na URL — o padrão de TODA tela de lista.
 *
 * Nasceu da reclamação do cliente (20/08/2026): navegar até a página 3 de
 * pedidos, abrir um pedido e voltar jogava na página 1, porque o estado
 * (página, aba, busca) vivia só em useState e o Voltar era um href fixo.
 *
 * O padrão tem duas metades:
 *
 *   1. `useListUrlMirror` na LISTA: espelha o estado navegável na query
 *      (?page=3&tab=...&q=...) com replaceState NATIVO — sem navegação, sem
 *      entrada extra no histórico, sem round-trip de RSC. Valores padrão
 *      ficam FORA da query para a URL limpa continuar limpa. Voltar do
 *      navegador e F5 restauram a tela exata. O estado inicial vem de
 *      `useSearchParams()` na montagem (nunca de window.location no render —
 *      SSR não tem window e hidrataria errado).
 *
 *   2. `useListReturnURL` no DETALHE: o botão "Voltar" aponta para a URL
 *      exata que a lista tinha (persistida em sessionStorage pela metade 1).
 *      router.back() NÃO serve: depois de navegar entre itens (prev/next),
 *      "voltar" recuaria para o item anterior, não para a lista. Link direto
 *      (sem sessão) cai no basePath puro.
 */

const returnKey = (basePath: string, scope?: string) =>
  `listReturnUrl:${basePath}${scope ? `:${scope}` : ""}`

/**
 * Espelha `entries` na query da URL e grava a URL resultante para o Voltar do
 * detalhe. `null`/vazio remove a chave — o chamador decide o que é "padrão".
 * `scope` separa contextos que dividem a sessão (ex.: storeId).
 */
export function useListUrlMirror(
  basePath: string,
  entries: Record<string, string | null>,
  scope?: string,
): void {
  const serialized = JSON.stringify(entries)

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(
      JSON.parse(serialized) as Record<string, string | null>,
    )) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const qs = params.toString()
    const url = qs ? `${basePath}?${qs}` : basePath
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", url)
    }
    try {
      sessionStorage.setItem(returnKey(basePath, scope), url)
    } catch {
      // Sem sessionStorage (modo privado/quota), o Voltar cai no basePath.
    }
  }, [serialized, basePath, scope])
}

/**
 * Href do "Voltar" de uma tela de detalhe: a última URL da listagem, ou o
 * basePath puro no acesso direto. Lido em efeito (não no render) para SSR e
 * hidratação verem o mesmo valor.
 */
export function useListReturnURL(basePath: string, scope?: string): string {
  const [href, setHref] = useState(basePath)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = sessionStorage.getItem(returnKey(basePath, scope))
      // Só aceita caminho da própria listagem — sessionStorage é dado, não código.
      if (saved && saved.startsWith(basePath)) setHref(saved)
    } catch {
      // Fallback basePath, como no mirror.
    }
  }, [basePath, scope])

  return href
}
