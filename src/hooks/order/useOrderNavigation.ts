"use client"

import { useEffect, useState } from "react"
import { useStoreId } from "@/hooks/useUser"

export interface OrderNavigationItem {
  id: string
  shortId: number
}

const STORAGE_KEY = (storeId: string) => `orderListIds:${storeId}`

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
