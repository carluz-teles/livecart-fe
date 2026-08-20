"use client"

import { use, useState } from "react"
import Image from "next/image"
import { Loader2, Minus, Package, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrderItemEdit, type OrderItemEdit } from "@/hooks/order/useOrderItemEdit"
import { formatCurrency } from "@/lib/format"
import { groupOrderItemsByProduct } from "@/lib/order-items"
import { cn } from "@/lib/utils"
import type { OrderDetail, OrderItem } from "@/types/cart.types"
import { OrderDetailAddItemSheet } from "./OrderDetail.AddItemSheet"
import { OrderDetailContext } from "./OrderDetailContext"

// isOrderItemEditable diz se o pedido aceita edição de itens pelo painel.
//
// Espelha os guardas do backend (assertCartMutable) menos o toggle
// `cart_allow_edit`, que é política sobre o COMPRADOR e não se aplica ao
// lojista. Aqui é só para não oferecer o que já sabemos que será recusado — a
// garantia é do servidor, com a leitura fresca no instante da escrita.
export function isOrderItemEditable(order: OrderDetail): boolean {
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") return false
  if (order.status === "cancelled" || order.status === "expired") return false
  if (order.expiresAt && new Date(order.expiresAt).getTime() < Date.now()) return false
  return true
}

export function OrderDetailItems() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  // O corpo vive num componente separado porque ele usa hooks de estado
  // (useOrderItemEdit). Chamá-los depois do `return null` acima seria chamada
  // condicional de hook: na primeira renderização com contexto, a contagem muda
  // e o React derruba a tela.
  return <ItensDoPedido order={ctx.state.order} />
}

function ItensDoPedido({ order }: { order: OrderDetail }) {
  const editavel = isOrderItemEditable(order)
  const edit = useOrderItemEdit({ orderId: order.id, enabled: editavel })

  // Desde a 000107 o pedido tem uma linha por (produto, sessão): o mesmo
  // produto comprado na live de segunda e no story de quinta chega em DUAS
  // linhas. Sem agrupar, o lojista vê "Vestido Preto" repetido e lê como bug.
  const agrupados = groupOrderItemsByProduct(order.items)

  // Itens mostra APENAS o que a cliente TEM (20/08/2026) — a parcela em fila
  // vive no card "Aguardando estoque" logo abaixo, uma vez só. Antes a tabela
  // somava as duas e repetia a fila numa nota âmbar por linha: o mesmo número
  // contado em dois lugares, lido como confusão. Linha 100% em fila só
  // aparece no modo edição (para o lojista poder mexer nela).
  const items = editavel
    ? agrupados
    : agrupados.filter((i) => i.quantity - i.waitlistedQuantity > 0)

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
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Package className="h-4 w-4" />
          Itens ({unidadesPagaveis})
        </CardTitle>
        {editavel && (
          <div className="print:hidden">
            <OrderDetailAddItemSheet
              productIdsNoPedido={items.map((i) => i.productId)}
              onAdd={edit.addItem}
              disabled={edit.isAnyBusy}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Produto</TableHead>
                <TableHead
                  className={cn(
                    "text-center",
                    editavel ? "w-[132px]" : "w-[80px]",
                  )}
                >
                  Qtd
                </TableHead>
                <TableHead className="w-[100px] text-right">Preço</TableHead>
                <TableHead className="w-[100px] text-right">Total</TableHead>
                {editavel && (
                  <TableHead className="w-[52px] print:hidden">
                    <span className="sr-only">Remover</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <LinhaDeItem
                  key={item.id}
                  item={item}
                  editavel={editavel}
                  edit={edit}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé de valores. Só aparece quando há fila: sem ela o subtotal é o
            mesmo "Produtos" do card de Pagamento, e repeti-lo seria ruído. */}
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

        {editavel && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground print:hidden">
            Alterar itens move o estoque na hora e no ERP. O frete escolhido é
            descartado e um PIX em aberto é cancelado — a cliente refaz essas duas
            etapas no link dela.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface LinhaDeItemProps {
  item: OrderItem
  editavel: boolean
  edit: OrderItemEdit
}

function LinhaDeItem({ item, editavel, edit }: LinhaDeItemProps) {
  const [confirmarRemocao, setConfirmarRemocao] = useState(false)

  const disponivel = Math.max(item.quantity - item.waitlistedQuantity, 0)
  const salvando = edit.isSaving(item.id)
  // Enquanto o stepper acumula, a linha mostra o valor que a lojista montou —
  // ver o número antigo por 600ms faria os cliques parecerem perdidos.
  //
  // O stepper fala em DISPONÍVEL (o que a cliente tem), nunca na soma com a
  // fila: o total salvo re-embute a parcela em fila na borda do onChange. A
  // soma na tela era exatamente a confusão relatada em 20/08/2026.
  const totalNaTela = editavel
    ? edit.displayQuantity(item.id, item.quantity)
    : item.quantity
  const pagavelNaTela = Math.max(totalNaTela - item.waitlistedQuantity, 0)

  return (
    <>
      <TableRow className={cn(salvando && "opacity-60")}>
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
            <p className="text-xs text-muted-foreground">Tamanho: {item.size}</p>
          )}
          <p className="font-mono text-xs text-muted-foreground">{item.keyword}</p>

        </TableCell>

        <TableCell className="text-center">
          {editavel ? (
            <Stepper
              quantidade={pagavelNaTela}
              salvando={salvando}
              nome={item.productName}
              onChange={(q) =>
                edit.setQuantity(item.id, q + item.waitlistedQuantity)
              }
            />
          ) : (
            <span
              className={cn(
                "tabular-nums",
                disponivel === 0 && "text-muted-foreground",
              )}
            >
              {disponivel}
            </span>
          )}
        </TableCell>

        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.unitPrice)}
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {formatCurrency(item.unitPrice * pagavelNaTela)}
        </TableCell>

        {editavel && (
          <TableCell className="print:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmarRemocao(true)}
              disabled={salvando}
              aria-label={`Remover ${item.productName} do pedido`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TableCell>
        )}
      </TableRow>

      <AlertDialog open={confirmarRemocao} onOpenChange={setConfirmarRemocao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {item.productName}?</AlertDialogTitle>
            {/* Confirmação porque remover é o passo menos reversível: devolve
                estoque no LiveCart e estorna a reserva no ERP. Aumentar e
                diminuir a quantidade não pede confirmação — é um clique para
                desfazer. */}
            <AlertDialogDescription className="leading-relaxed">
              O item sai do pedido e{" "}
              {item.quantity === 1
                ? "1 unidade volta"
                : `${item.quantity} unidades voltam`}{" "}
              para o catálogo, com a reserva estornada no ERP. Para trazer de
              volta você adiciona o produto outra vez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => edit.removeItem(item.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface StepperProps {
  quantidade: number
  salvando: boolean
  nome: string
  onChange: (quantidade: number) => void
}

// Stepper de quantidade.
//
// Os cliques são acumulados pelo hook e viram UM envio: cada requisição move
// estoque no ERP atravessando um limitador de ~1 por segundo, então "+" três
// vezes tem de virar quantidade 4, não três lançamentos.
//
// O piso é 1 de propósito: chegar a zero é remover, e remover tem confirmação
// própria — deixar o "−" esvaziar a linha faria a ação mais destrutiva acontecer
// pelo caminho sem aviso.
function Stepper({ quantidade, salvando, nome, onChange }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onChange(quantidade - 1)}
        disabled={salvando || quantidade <= 1}
        aria-label={`Diminuir quantidade de ${nome}`}
      >
        <Minus className="h-3 w-3" aria-hidden="true" />
      </Button>

      <span
        className="w-10 text-center text-sm tabular-nums"
        aria-live="polite"
        aria-label={`Quantidade de ${nome}: ${quantidade}`}
      >
        {salvando ? (
          <Loader2
            className="mx-auto h-3.5 w-3.5 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          quantidade
        )}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onChange(quantidade + 1)}
        disabled={salvando}
        aria-label={`Aumentar quantidade de ${nome}`}
      >
        <Plus className="h-3 w-3" aria-hidden="true" />
      </Button>
    </div>
  )
}
