import type { QueryClient } from "@tanstack/react-query"
import type { IntegrationListResponse } from "@/types"
import { productKeys } from "@/hooks/product/useProducts"

export function refreshProductsAfterResync(
  client: QueryClient,
  storeId: string,
  previous: IntegrationListResponse | undefined,
  current: IntegrationListResponse,
) {
  const finished = previous?.data.some(
    (before) =>
      before.erpResyncRunning &&
      current.data.some(
        (after) => after.id === before.id && !after.erpResyncRunning,
      ),
  )
  if (!finished) return
  // The marker means the worker stopped, not that every product succeeded.
  // Refresh this store's cached data in both cases, including open details.
  void client.invalidateQueries({ queryKey: [...productKeys.lists(), storeId] })
  void client.invalidateQueries({
    queryKey: [...productKeys.details(), storeId],
  })
  void client.invalidateQueries({ queryKey: productKeys.stats(storeId) })
  void client.invalidateQueries({
    queryKey: ["product-groups", "list", storeId],
  })
}
