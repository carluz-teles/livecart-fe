"use client"

import { useState } from "react"
import {
  Check,
  ExternalLink,
  Image as ImageIcon,
  Instagram,
  Loader2,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useInstagramMedia } from "@/hooks/integration"
import { useCreatePostEvent } from "@/hooks/event"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { InstagramMediaPost, Product } from "@/types"

const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  CAROUSEL_ALBUM: "Carrossel",
  REELS: "Reel",
  REEL: "Reel",
}

export function PostEventForm({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedPost, setSelectedPost] = useState<InstagramMediaPost | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const media = useInstagramMedia(open)
  const { data: productsData, isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"] },
  })
  const createPost = useCreatePostEvent()

  const products = productsData?.data ?? []
  const posts = media.data?.data ?? []

  const reset = () => {
    setTitle("")
    setSelectedPost(null)
    setSelectedProductIds([])
    setSearch("")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    setOpen(next)
  }

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const canSubmit = !!selectedPost && selectedProductIds.length > 0 && !createPost.isPending

  const handleSubmit = () => {
    if (!selectedPost) return
    createPost.mutate(
      {
        title: title.trim() || undefined,
        mediaId: selectedPost.id,
        mediaPermalink: selectedPost.permalink,
        mediaThumbnailUrl: selectedPost.thumbnail_url || selectedPost.media_url,
        mediaCaption: selectedPost.caption,
        productIds: selectedProductIds,
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
      <SheetTrigger asChild>
        <Button variant="outline">
          <Instagram className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Novo evento de post
          </SheetTitle>
          <SheetDescription>
            Selecione um post do Instagram e os produtos da promoção. Capturamos os
            comentários do post e montamos os carrinhos automaticamente.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="post-title">Título (opcional)</Label>
            <Input
              id="post-title"
              placeholder="Ex: Promoção da Sexta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Step 1 — post selector */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  1
                </span>
                <h3 className="text-sm font-medium">Selecione o post</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => media.refetch()}
                disabled={media.isFetching}
              >
                <RefreshCw className={cn("mr-2 h-3.5 w-3.5", media.isFetching && "animate-spin")} />
                Atualizar
              </Button>
            </div>

            <PostGrid
              posts={posts}
              loading={media.isLoading}
              error={media.isError}
              selectedId={selectedPost?.id ?? null}
              onSelect={setSelectedPost}
            />

            {selectedPost && (
              <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                <PostThumb post={selectedPost} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedPost.caption || "Post sem legenda"}
                  </p>
                  <p className="text-xs text-muted-foreground">Post selecionado</p>
                </div>
                {selectedPost.permalink && (
                  <a
                    href={selectedPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ver no Instagram
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
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

function PostThumb({ post, className }: { post: InstagramMediaPost; className?: string }) {
  const src = post.thumbnail_url || post.media_url
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-muted", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}

interface PostGridProps {
  posts: InstagramMediaPost[]
  loading: boolean
  error: boolean
  selectedId: string | null
  onSelect: (post: InstagramMediaPost) => void
}

function PostGrid({ posts, loading, error, selectedId, onSelect }: PostGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
        <Instagram className="h-7 w-7 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os posts. Verifique se o Instagram está conectado.
        </p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
        <Instagram className="h-7 w-7 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Nenhum post encontrado nesta conta.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post) => {
        const selected = post.id === selectedId
        return (
          <button
            type="button"
            key={post.id}
            onClick={() => onSelect(post)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-md border transition-all",
              selected
                ? "border-primary ring-2 ring-primary"
                : "border-transparent hover:border-muted-foreground/30"
            )}
            aria-pressed={selected}
          >
            <PostThumb post={post} className="h-full w-full rounded-none" />

            {/* gradient + meta */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[10px] font-medium text-white">
                  {MEDIA_TYPE_LABELS[post.media_type] || "Post"}
                </span>
                {typeof post.comments_count === "number" && (
                  <span className="flex items-center gap-0.5 text-[10px] text-white/90">
                    <MessageCircle className="h-2.5 w-2.5" />
                    {post.comments_count}
                  </span>
                )}
              </div>
            </div>

            {selected && (
              <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

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
