import type { OrderItem } from "@/types/cart.types"

/**
 * Agrupa as linhas do pedido por produto.
 *
 * Desde a migration 000107 o pedido tem **uma linha por (produto, sessão)** —
 * o mesmo vestido comprado na live de segunda e no story de quinta são duas
 * linhas em `order_items`. Isso é proposital: é o que faz a receita por
 * transmissão fechar exatamente com o total do pedido. Mas é uma quebra de
 * contabilidade, não de catálogo: para o lojista continua sendo **um** produto,
 * e a tela que mostra "Vestido Preto" duas vezes parece um bug de duplicação.
 *
 * Vale para toda superfície que trate o item como coisa física — a lista do
 * detalhe e, principalmente, o payload da transportadora, que senão despacharia
 * o mesmo produto em duas linhas.
 *
 * O que NÃO agrupa: nada que seja por sessão de propósito (a métrica por
 * transmissão). Ali a repetição é a informação.
 */
export function groupOrderItemsByProduct(items: OrderItem[]): OrderItem[] {
  const byProduct = new Map<string, OrderItem>()

  for (const item of items) {
    // `size` continua separando linhas: dois tamanhos do mesmo produto são
    // dois itens físicos distintos, e juntá-los perderia o que despachar.
    const key = `${item.productId}::${item.size ?? ""}`
    const existing = byProduct.get(key)
    if (!existing) {
      byProduct.set(key, { ...item })
      continue
    }
    existing.quantity += item.quantity
    // Soma os totais em vez de recalcular por `unitPrice`: se o preço mudou
    // entre uma sessão e outra, recalcular inventaria um número que não bate
    // com o que o comprador pagou.
    existing.totalPrice += item.totalPrice
  }

  return Array.from(byProduct.values())
}
