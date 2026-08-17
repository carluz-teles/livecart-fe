"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, Package, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { formatCurrency } from "@/lib/format"
import type { Product } from "@/types"

interface OrderDetailAddItemSheetProps {
  /** Produtos já no pedido — a linha existente é somada, não duplicada. */
  productIdsNoPedido: string[]
  onAdd: (productId: string, quantity: number) => Promise<void>
  disabled?: boolean
}

// Adicionar produto do catálogo a um pedido aguardando pagamento.
//
// Sheet pela direita seguindo a convenção do projeto para formulário simples. A
// busca é sobre o CATÁLOGO da loja, não sobre a whitelist do evento: o pedido do
// lojista foi "adicionar outros produtos cadastrados no LiveCart", e a whitelist
// existe para limitar o que a audiência pede por comentário durante a live.
export function OrderDetailAddItemSheet({
  productIdsNoPedido,
  onAdd,
  disabled,
}: OrderDetailAddItemSheetProps) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState("")
  const [adicionando, setAdicionando] = useState<string | null>(null)

  const buscaDebounced = useDebounce(busca, 300)
  const { data, isLoading, isError } = useProducts({
    search: buscaDebounced || undefined,
    pagination: { page: 1, limit: 20 },
    // Só produto ativo: inativo não tem preço nem estoque que signifiquem algo,
    // e o backend recusaria a adição depois de a lojista escolher.
    filters: { status: ["active"] },
  })

  const produtos: Product[] = data?.data ?? []

  const handleAdd = async (produto: Product) => {
    setAdicionando(produto.id)
    try {
      await onAdd(produto.id, 1)
      // Fecha ao concluir: a lojista pediu UM produto, e manter aberto a faria
      // duvidar se a adição funcionou. Adicionar outro é reabrir.
      setOpen(false)
      setBusca("")
    } catch {
      // O hook já explicou o motivo no toast; o Sheet fica aberto para ela
      // corrigir (escolher outro produto, ou desistir).
    } finally {
      setAdicionando(null)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // Não fecha no meio de uma adição: o Sheet sumindo durante a chamada
        // esconde de qual produto era o resultado.
        if (adicionando) return
        setOpen(next)
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar produto
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Adicionar produto ao pedido</SheetTitle>
          <SheetDescription className="leading-relaxed">
            Qualquer produto ativo do seu catálogo. O estoque é reservado na hora
            e a cliente precisa escolher o frete de novo.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="add-item-search">Buscar no catálogo</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="add-item-search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome ou código do produto"
              className="pl-9"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          <OrderDetailCatalogList
            produtos={produtos}
            isLoading={isLoading}
            isError={isError}
            buscou={!!buscaDebounced}
            productIdsNoPedido={productIdsNoPedido}
            adicionando={adicionando}
            onAdd={handleAdd}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export interface OrderDetailCatalogListProps {
  produtos: Product[]
  isLoading: boolean
  isError: boolean
  /** Já houve termo de busca — muda o texto do vazio. */
  buscou: boolean
  productIdsNoPedido: string[]
  /** Id do produto sendo adicionado agora, ou null. */
  adicionando: string | null
  onAdd: (produto: Product) => void
}

// Catálogo dentro do Sheet — puramente apresentacional.
//
// Separado da chamada de dados porque são cinco estados (carregando, erro,
// catálogo vazio, busca sem resultado, lista) e porque a regra que mais importa
// mora aqui: produto sem estoque não é clicável. Deixá-lo clicável faria a
// lojista escolher e receber um erro do servidor que a tela já sabia prever.
export function OrderDetailCatalogList({
  produtos,
  isLoading,
  isError,
  buscou,
  productIdsNoPedido,
  adicionando,
  onAdd,
}: OrderDetailCatalogListProps) {
  return (
    <>
          {isLoading && (
            <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Carregando catálogo...
            </p>
          )}

          {!isLoading && isError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              Não conseguimos carregar o catálogo. Tente de novo em alguns
              segundos.
            </p>
          )}

          {!isLoading && !isError && produtos.length === 0 && (
            <div className="rounded-md border border-dashed px-4 py-8 text-center">
              <p className="text-sm font-medium">Nenhum produto encontrado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {buscou
                  ? "Tente outro nome ou código."
                  : "Cadastre produtos para poder adicioná-los a um pedido."}
              </p>
            </div>
          )}

          <ul className="divide-y">
            {produtos.map((produto) => (
              <LinhaDeProduto
                key={produto.id}
                produto={produto}
                jaNoPedido={productIdsNoPedido.includes(produto.id)}
                adicionando={adicionando === produto.id}
                bloqueado={!!adicionando && adicionando !== produto.id}
                onAdd={() => onAdd(produto)}
              />
            ))}
          </ul>
    </>
  )
}

interface LinhaDeProdutoProps {
  produto: Product
  jaNoPedido: boolean
  adicionando: boolean
  bloqueado: boolean
  onAdd: () => void
}

function LinhaDeProduto({
  produto,
  jaNoPedido,
  adicionando,
  bloqueado,
  onAdd,
}: LinhaDeProdutoProps) {
  const semEstoque = produto.stock <= 0

  return (
    <li className="flex items-center gap-3 py-3">
      {produto.imageUrl ? (
        <Image
          src={produto.imageUrl}
          alt={produto.name}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{produto.name}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono">{produto.keyword}</span> ·{" "}
          <span className="tabular-nums">{formatCurrency(produto.price)}</span> ·{" "}
          {/* Estoque não é enfeite: é o número que decide se a adição vai ser
              aceita. Mostrá-lo evita a tentativa que volta em erro. */}
          <span className={semEstoque ? "text-destructive" : "tabular-nums"}>
            {semEstoque ? "sem estoque" : `${produto.stock} em estoque`}
          </span>
        </p>
        {jaNoPedido && (
          <Badge variant="secondary" className="mt-1">
            Já no pedido — soma na linha existente
          </Badge>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onAdd}
        disabled={adicionando || bloqueado || semEstoque}
        aria-label={`Adicionar ${produto.name} ao pedido`}
      >
        {adicionando ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </li>
  )
}
