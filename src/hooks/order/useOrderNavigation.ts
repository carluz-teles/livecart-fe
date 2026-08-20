"use client"

import { useEffect, useState } from "react"
import { useStoreId } from "@/hooks/useUser"

export interface OrderNavigationItem {
  id: string
  shortId: number
}

const STORAGE_KEY = (storeId: string) => `orderListIds:${storeId}`
const RETURN_URL_KEY = (storeId: string) => `orderListReturnUrl:${storeId}`

// Reads the breadcrumb of order ids the listing dropped on session storage
// (set by OrderListProvider whenever its query resolves) and returns the
// neighbours of the order being viewed. Falls back to null when the buyer
// arrived via a direct link or the listing snapshot is empty.
export function useOrderNavigation(currentId: string) {
  const { storeId } = useStoreId()
  const [items, setItems] = useState<OrderNavigationItem[]>([])

  useEffect(() => {
    if (!storeId || typeof window === "undefined") return
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY(storeId))
      if (raw) setItems(JSON.parse(raw) as OrderNavigationItem[])
    } catch {
      // sessionStorage can throw on private mode / quota errors — silently fall
      // back to "no neighbours" so the detail page still renders normally.
    }
  }, [storeId])

  const idx = items.findIndex((it) => it.id === currentId)
  if (idx === -1) {
    return {
      prev: null as OrderNavigationItem | null,
      next: null as OrderNavigationItem | null,
      total: items.length,
      position: 0,
    }
  }
  return {
    prev: idx > 0 ? items[idx - 1] : null,
    next: idx < items.length - 1 ? items[idx + 1] : null,
    total: items.length,
    position: idx + 1,
  }
}

// Imperatively snapshot the current page of order ids from the listing so the
// detail page can navigate prev/next using the same filter/sort/page the user
// is browsing. Called from OrderListProvider on every successful query.
export function persistOrderListSnapshot(
  storeId: string,
  items: OrderNavigationItem[],
): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY(storeId), JSON.stringify(items))
  } catch {
    // Same fallback rationale as the read path.
  }
}

// A URL exata da listagem que o lojista estava vendo (página, aba, busca),
// gravada pelo OrderListProvider. O "Voltar" do detalhe aponta para ela —
// antes era um href fixo para /orders, que jogava quem estava na página 3 de
// volta para a página 1 (reclamação do cliente, 20/08/2026). router.back()
// não serve aqui: depois de navegar entre pedidos com prev/next, "voltar"
// recuaria para o pedido anterior, não para a lista.
export function persistOrderListReturnURL(storeId: string, url: string): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(RETURN_URL_KEY(storeId), url)
  } catch {
    // Mesmo fallback do snapshot: sem sessionStorage, o Voltar cai em /orders.
  }
}

// Href do "Voltar para pedidos". Lido em efeito (não no render) para o SSR e a
// hidratação verem o mesmo valor; até lá vale o fallback /orders.
export function useOrderListReturnURL(): string {
  const { storeId } = useStoreId()
  const [href, setHref] = useState("/orders")

  useEffect(() => {
    if (!storeId || typeof window === "undefined") return
    try {
      const saved = sessionStorage.getItem(RETURN_URL_KEY(storeId))
      // Só aceita caminho da própria listagem — sessionStorage é dado, não código.
      if (saved && saved.startsWith("/orders")) setHref(saved)
    } catch {
      // Fallback /orders, como no snapshot.
    }
  }, [storeId])

  return href
}
