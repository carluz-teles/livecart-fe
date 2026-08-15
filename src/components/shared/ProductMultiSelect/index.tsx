"use client"

import { useState } from "react"
import { Check, Package, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductMultiSelectProps {
  value: string[]
  onChange: (ids: string[]) => void
  /** Exige estoque > 0. Publicar um post pede isso (a venda começa agora);
   *  configurar uma transmissão não, porque o estoque pode voltar antes dela. */
  requireStock?: boolean
  /** Altura da lista. */
  height?: string
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * Seleção múltipla de produtos.
 *
 * Nasceu dentro do `CreatePostForm` e foi extraída quando a criação de
 * transmissão passou a precisar da mesma lista. Duas cópias divergiriam no
 * primeiro ajuste — e este código já teve exatamente esse problema: a definição
 * de "produto disponível" existia em dois lugares e uma delas filtrava estoque
 * enquanto a outra não.
 */
export function ProductMultiSelect({
  value,
  onChange,
  requireStock = false,
  height = "h-[220px]",
}: ProductMultiSelectProps) {
  const [search, setSearch] = useState("")
  // Sem debounce, cada tecla vira uma consulta — e a lista pisca a cada letra.
  const debouncedSearch = useDebounce(search, 300)

  // `useProducts` não aceita `enabled`; a busca só roda porque o componente
  // inteiro é desmontado quando o bloco está fechado.
  const { data, isLoading, isError, refetch } = useProducts({
    search: debouncedSearch || undefined,
    filters: requireStock
      ? { status: ["active"], stockMin: 1 }
      : { status: ["active"] },
  })

  const products = data?.data ?? []

  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto"
          className="pl-8"
        />
      </div>

      <ScrollArea className={cn("rounded-md border", height)}>
        <div className="space-y-1 p-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          ) : isError ? (
            // Erro com saída, não beco: sem o botão, a única forma de tentar de
            // novo é fechar o formulário e perder o que já foi preenchido.
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar os produtos.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm font-medium text-primary hover:underline"
              >
                Tentar de novo
              </button>
            </div>
          ) : products.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {search ? "Nada encontrado." : "Nenhum produto ativo."}
            </p>
          ) : (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={value.includes(product.id)}
                onToggle={() => toggle(product.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function ProductRow({
  product,
  selected,
  onToggle,
}: {
  product: Product
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors",
        selected ? "bg-primary/10" : "hover:bg-muted",
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input",
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-4 w-4 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {product.groupName || product.name}
        </p>
        {product.optionValues && product.optionValues.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {product.optionValues.map((v) => (
              <span
                key={v.option}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] leading-none"
              >
                <span className="text-muted-foreground">{v.option}</span>
                <span className="ml-1 font-semibold">{v.value}</span>
              </span>
            ))}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-mono">{product.keyword}</span>
          <span aria-hidden>•</span>
          <span>{formatCurrency(product.price)}</span>
          <span aria-hidden>•</span>
          {/* Estoque zero em vermelho, não escondido: a mídia já existe e o
              estoque pode voltar antes da venda — esconder o produto obrigaria o
              lojista a refazer a transmissão depois de repor. */}
          <span
            className={cn(
              "whitespace-nowrap",
              product.stock === 0 && "font-medium text-destructive",
            )}
          >
            {product.stock} em estoque
          </span>
        </div>
      </div>
    </button>
  )
}
