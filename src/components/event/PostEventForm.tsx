"use client"

import { useState } from "react"
import { Check, Instagram, Loader2, Package, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreatePostEvent } from "@/hooks/event"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { FieldHint } from "@/components/shared/FieldHint"
import {
  EVENT_COPY,
  defaultEndsAtLocal,
  isLongCampaign,
  LONG_CAMPAIGN_WARNING,
} from "@/lib/event-copy"
import {
  InstagramMediaPicker,
  sessionTypeFromMediaType,
} from "./InstagramMediaPicker"
import type { InstagramMediaPost, Product } from "@/types"

interface PostEventFormProps {
  /** Controlled open state. When provided, the internal trigger is hidden. */
  open?: boolean
  /** Custom trigger; pass null to render no trigger (controlled usage). */
  trigger?: React.ReactNode | null
  onClose?: () => void
  onSuccess?: () => void
}

export function PostEventForm({
  open: controlledOpen,
  trigger,
  onClose,
  onSuccess,
}: PostEventFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const [title, setTitle] = useState("")
  const [selectedPost, setSelectedPost] = useState<InstagramMediaPost | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [startsAt, setStartsAt] = useState("")
  // endsAt é OBRIGATÓRIO (RN-05): sem teto, o carrinho da promoção fica sem
  // prazo para sempre. Nasce preenchido com 24h à frente para o lojista não
  // esbarrar num campo obrigatório vazio.
  const [endsAt, setEndsAt] = useState(defaultEndsAtLocal)
  const [cartExpirationMinutes, setCartExpirationMinutes] = useState<number | null>(null)
  const [maxQty, setMaxQty] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  // Only promotable products: active AND in stock, ordered by name (variants of
  // the same product sit together).
  const { data: productsData, isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"], stockMin: 1 },
    sorting: { sortBy: "name", sortOrder: "asc" },
  })
  const createPost = useCreatePostEvent()

  const products = productsData?.data ?? []

  const reset = () => {
    setTitle("")
    setSelectedPost(null)
    setSelectedProductIds([])
    setStartsAt("")
    setEndsAt(defaultEndsAtLocal())
    setCartExpirationMinutes(null)
    setMaxQty(null)
    setSearch("")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    if (!isControlled) setInternalOpen(next)
    if (!next) onClose?.()
  }

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const windowInvalid =
    !!startsAt && !!endsAt && new Date(endsAt) <= new Date(startsAt)
  const endsAtMissing = !endsAt

  const canSubmit =
    !!selectedPost &&
    selectedProductIds.length > 0 &&
    !windowInvalid &&
    !endsAtMissing &&
    !createPost.isPending

  // datetime-local gives a tz-less local string; interpret it in the merchant's
  // browser timezone and serialize to UTC ISO for the API.
  const toISO = (v: string) => (v ? new Date(v).toISOString() : undefined)

  const handleSubmit = () => {
    if (!selectedPost) return
    if (endsAtMissing) {
      toast.error("Informe quando a promoção encerra.", {
        description:
          "É o teto que faz o prazo do comprador começar a correr — sem ele o carrinho não expira nunca.",
      })
      return
    }
    if (windowInvalid) {
      toast.error("A data de término deve ser depois da data de início.")
      return
    }
    createPost.mutate(
      {
        title: title.trim() || undefined,
        // A espécie sai do `media_type` da mídia escolhida. Sem isto o backend
        // grava 'post' fixo, e um Reel selecionado aqui nascia com rótulo
        // diferente do MESMO Reel publicado pelo LiveCart.
        type: sessionTypeFromMediaType(selectedPost.media_type),
        mediaId: selectedPost.id,
        mediaPermalink: selectedPost.permalink,
        mediaThumbnailUrl: selectedPost.thumbnail_url || selectedPost.media_url,
        mediaCaption: selectedPost.caption,
        productIds: selectedProductIds,
        startsAt: toISO(startsAt),
        endsAt: new Date(endsAt).toISOString(),
        cartExpirationMinutes,
        cartMaxQuantityPerItem: maxQty,
      },
      {
        onSuccess: () => {
          toast.success("Evento de post criado!", {
            description: "Os comentários do post já estão sendo capturados.",
          })
          handleOpenChange(false)
          onSuccess?.()
        },
        onError: (err: { message?: string }) =>
          toast.error("Erro ao criar evento de post", {
            description: err.message || "Tente novamente.",
          }),
      }
    )
  }

  const ruleHint =
    selectedProductIds.length === 1
      ? 'Com 1 produto, um comentário "EU QUERO" já adiciona ao carrinho.'
      : selectedProductIds.length > 1
        ? 'Com vários produtos, o cliente precisa comentar a palavra-chave (ex: "EU QUERO 1005").'
        : "Selecione os produtos que farão parte desta promoção."

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger ?? (
            <Button variant="outline">
              <Instagram className="mr-2 h-4 w-4" />
              Novo Post
            </Button>
          )}
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Vender por um post que já existe
          </SheetTitle>
          <SheetDescription>
            Atalho: cria a campanha e a primeira transmissão de uma vez. Selecione o post
            e os produtos — capturamos os comentários e montamos os carrinhos. Depois você
            pode adicionar outras transmissões (live, reel, story) à mesma campanha.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="post-title" className="flex items-center gap-1.5">
              {EVENT_COPY.title.label}
            </Label>
            <Input
              id="post-title"
              placeholder={EVENT_COPY.title.placeholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. É o nome da campanha que o comprador vê nas mensagens — e esta
              publicação é a primeira transmissão dela.
            </p>
          </div>

          {/* Step 1 — post selector */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                1
              </span>
              <h3 className="text-sm font-medium">Selecione o post</h3>
            </div>

            <InstagramMediaPicker
              enabled={open}
              selected={selectedPost}
              onSelect={setSelectedPost}
            />
          </section>

          {/* Step 2 — products */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                2
              </span>
              <h3 className="text-sm font-medium">Produtos da promoção</h3>
              {selectedProductIds.length > 0 && (
                <Badge variant="secondary">{selectedProductIds.length} selecionado(s)</Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{ruleHint}</p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou palavra-chave..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[260px] rounded-md border">
              <div className="space-y-1 p-2">
                {productsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Package className="h-7 w-7 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {search ? "Nenhum produto encontrado" : "Nenhum produto ativo"}
                    </p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      selected={selectedProductIds.includes(product.id)}
                      onToggle={() => toggleProduct(product.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </section>

          {/* Step 3 — schedule + cart settings */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                3
              </span>
              <h3 className="text-sm font-medium">Janela e carrinho</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-starts" className="flex items-center gap-1.5">
                  {EVENT_COPY.startsAt.label}
                  <FieldHint text={EVENT_COPY.startsAt.hint} />
                </Label>
                <Input
                  id="post-starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{EVENT_COPY.startsAt.empty}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-ends" className="flex items-center gap-1.5">
                  {EVENT_COPY.endsAt.label} <span className="text-destructive">*</span>
                  <FieldHint text={EVENT_COPY.endsAt.hint} />
                </Label>
                <Input
                  id="post-ends"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{EVENT_COPY.endsAt.help}</p>
              </div>
            </div>
            {endsAtMissing && (
              <p className="text-sm text-destructive">Informe quando a promoção encerra.</p>
            )}
            {windowInvalid && (
              <p className="text-sm text-destructive">
                O término deve ser depois do início.
              </p>
            )}
            {isLongCampaign(startsAt || null, endsAt || null) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {LONG_CAMPAIGN_WARNING}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  {EVENT_COPY.cartExpiration.label}
                  <FieldHint text={EVENT_COPY.cartExpiration.hint} />
                </Label>
                <Select
                  value={cartExpirationMinutes === null ? "inherit" : String(cartExpirationMinutes)}
                  onValueChange={(v) =>
                    setCartExpirationMinutes(v === "inherit" ? null : parseInt(v, 10))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Usar padrão da loja</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  {EVENT_COPY.maxQuantity.label}
                  <FieldHint text={EVENT_COPY.maxQuantity.hint} />
                </Label>
                <Select
                  value={maxQty === null ? "inherit" : String(maxQty)}
                  onValueChange={(v) => setMaxQty(v === "inherit" ? null : parseInt(v, 10))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Usar padrão da loja</SelectItem>
                    <SelectItem value="1">1 unidade</SelectItem>
                    <SelectItem value="3">3 unidades</SelectItem>
                    <SelectItem value="5">5 unidades</SelectItem>
                    <SelectItem value="10">10 unidades</SelectItem>
                  </SelectContent>
                </Select>
                {maxQty !== null && (
                  <p className="text-xs text-muted-foreground">
                    {EVENT_COPY.maxQuantity.help}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={createPost.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {createPost.isPending ? "Criando..." : "Criar evento de post"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------

interface ProductRowProps {
  product: Product
  selected: boolean
  onToggle: () => void
}

function ProductRow({ product, selected, onToggle }: ProductRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors",
        selected ? "bg-primary/10" : "hover:bg-muted"
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input"
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>

      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-4 w-4 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{product.keyword}</span>
          <span>•</span>
          <span>{formatCurrency(product.price)}</span>
          <span>•</span>
          <span>{product.stock} em estoque</span>
        </div>
      </div>
    </button>
  )
}
