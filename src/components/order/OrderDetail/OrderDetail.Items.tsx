"use client"

import { use } from "react"
import Image from "next/image"
import { Clock, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { groupOrderItemsByProduct } from "@/lib/order-items"
import { OrderDetailContext } from "./OrderDetailContext"

export function OrderDetailItems() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  // Desde a 000107 o pedido tem uma linha por (produto, sessão): o mesmo
  // produto comprado na live de segunda e no story de quinta chega em DUAS
  // linhas. Sem agrupar, o lojista vê "Vestido Preto" repetido e lê como bug.
  const items = groupOrderItemsByProduct(order.items)

  // `quantity` é o total pedido; a parcela em fila não tem estoque para
  // entregar. A coluna Qtd mostra o que dá para faturar, e a linha em fila
  // explica por que o número está menor do que a cliente pediu — sem a
  // explicação, o lojista lê a diferença como item perdido.
  const temFila = items.some((item) => item.waitlistedQuantity > 0)
  const unidadesPagaveis = items.reduce(
    (soma, item) => soma + Math.max(item.quantity - item.waitlistedQuantity, 0),
    0,
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Package className="h-4 w-4" />
          Itens ({unidadesPagaveis})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="w-[80px] text-center">Qtd</TableHead>
                <TableHead className="w-[100px] text-right">Preço</TableHead>
                <TableHead className="w-[100px] text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const disponivel = Math.max(
                  item.quantity - item.waitlistedQuantity,
                  0,
                )
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{item.productName}</p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">
                          Tamanho: {item.size}
                        </p>
                      )}
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.keyword}
                      </p>
                      {item.waitlistedQuantity > 0 && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {item.waitlistedQuantity} em fila · sem estoque
                        </p>
                      )}
                    </TableCell>
                    {/* Zero aparece de propósito. A unidade em fila pode ficar
                        no cart sem entrada ativa na fila (quem sai da fila com
                        status `waiting` tem a entrada cancelada, mas
                        waitlisted_quantity não é decrementado), e esta linha é o
                        único lugar do painel onde ela fica visível. Esconder
                        linha sem unidade pagável apagaria isso da vista. */}
                    <TableCell
                      className={
                        disponivel === 0
                          ? "text-center tabular-nums text-muted-foreground"
                          : "text-center tabular-nums"
                      }
                    >
                      {disponivel}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(item.unitPrice * disponivel)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé de valores. Só aparece quando há fila: sem ela o subtotal é o
            mesmo "Valor total" do card de Pagamento, e repeti-lo seria ruído. */}
        {temFila && (
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">Subtotal a pagar</dt>
              <dd className="font-medium tabular-nums">
                {formatCurrency(order.payableAmount)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between text-amber-700 dark:text-amber-500">
              <dt>Em fila (não cobrado)</dt>
              <dd className="tabular-nums">
                {formatCurrency(order.waitlistedAmount)}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
