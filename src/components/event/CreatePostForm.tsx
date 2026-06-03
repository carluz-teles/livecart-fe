"use client"

import { useRef, useState } from "react"
import { Check, ImagePlus, Loader2, Package, Search, X } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCreateInstagramPost, useCreateInstagramReel } from "@/hooks/event"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface CreatePostFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreatePostForm({ open, onClose, onSuccess }: CreatePostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mediaType, setMediaType] = useState<"image" | "reel">("image")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [title, setTitle] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [cartExpirationMinutes, setCartExpirationMinutes] = useState<number | null>(null)
  const [maxQty, setMaxQty] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { data: productsData, isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"] },
  })
  const createPost = useCreateInstagramPost()
  const createReel = useCreateInstagramReel()
  const isPending = createPost.isPending || createReel.isPending
  const products = productsData?.data ?? []

  const reset = () => {
    setFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setCaption("")
    setTitle("")
    setSelectedProductIds([])
    setStartsAt("")
    setEndsAt("")
    setCartExpirationMinutes(null)
    setMaxQty(null)
    setSearch("")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset()
      onClose()
    }
  }

  const switchMediaType = (next: "image" | "reel") => {
    if (next === mediaType) return
    setMediaType(next)
    setFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const pickFile = (f: File | undefined) => {
    if (!f) return
    if (mediaType === "image") {
      if (f.type !== "image/jpeg") {
        toast.error("O Instagram exige uma imagem JPEG (.jpg).")
        return
      }
      if (f.size > 8 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo de 8MB.")
        return
      }
    } else {
      if (f.type !== "video/mp4" && f.type !== "video/quicktime") {
        toast.error("Para Reels, envie um vídeo MP4.")
        return
      }
      if (f.size > 300 * 1024 * 1024) {
        toast.error("Vídeo muito grande. Máximo de 300MB.")
        return
      }
    }
    setFile(f)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
  }

  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )

  const toISO = (v: string) => (v ? new Date(v).toISOString() : undefined)
  const windowInvalid = !!startsAt && !!endsAt && new Date(endsAt) <= new Date(startsAt)
  const canSubmit =
    !!file && selectedProductIds.length > 0 && !windowInvalid && !isPending

  const ruleHint =
    selectedProductIds.length === 1
      ? 'Com 1 produto, um comentário "EU QUERO" já adiciona ao carrinho.'
      : selectedProductIds.length > 1
        ? 'Com vários produtos, o cliente comenta a palavra-chave (ex: "EU QUERO 1005").'
        : "Selecione os produtos que farão parte desta promoção."

  const handleSubmit = () => {
    if (!file) return
    if (windowInvalid) {
      toast.error("A data de término deve ser depois da data de início.")
      return
    }
    const payload = {
      file,
      caption: caption.trim() || undefined,
      title: title.trim() || undefined,
      productIds: selectedProductIds,
      startsAt: toISO(startsAt),
      endsAt: toISO(endsAt),
      cartExpirationMinutes,
      cartMaxQuantityPerItem: maxQty,
    }
    const callbacks = {
      onSuccess: () => {
        toast.success(
          mediaType === "reel" ? "Reel publicado no Instagram!" : "Post publicado no Instagram!",
          { description: "O evento já está ativo e capturando comentários." }
        )
        reset()
        onClose()
        onSuccess?.()
      },
      onError: (err: { message?: string }) =>
        toast.error("Erro ao publicar", { description: err.message || "Tente novamente." }),
    }
    if (mediaType === "reel") {
      createReel.mutate(payload, callbacks)
    } else {
      createPost.mutate(payload, callbacks)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Criar post no Instagram</SheetTitle>
          <SheetDescription>
            Publique um post de foto direto pelo LiveCart e já comece a vender pelos
            comentários — sem sair daqui.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Step 1 — media + caption */}
          <section className="space-y-3">
            <SectionTitle n={1} title="Mídia e legenda" />

            {/* Media type toggle */}
            <div className="inline-flex rounded-md border p-0.5">
              <button
                type="button"
                onClick={() => switchMediaType("image")}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  mediaType === "image" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Foto
              </button>
              <button
                type="button"
                onClick={() => switchMediaType("reel")}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  mediaType === "reel" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Reels
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === "image" ? "image/jpeg" : "video/mp4"}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-lg border">
                {mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="max-h-72 w-full object-contain bg-muted" />
                ) : (
                  <video src={previewUrl} controls className="max-h-72 w-full bg-black" />
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    setFile(null)
                    setPreviewUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev)
                      return null
                    })
                  }}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Trocar
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <ImagePlus className="h-7 w-7 text-muted-foreground/60" />
                <span className="text-sm font-medium">
                  {mediaType === "image" ? "Selecionar imagem (JPEG)" : "Selecionar vídeo (MP4)"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mediaType === "image"
                    ? "Até 8MB • proporção entre 4:5 e 1.91:1"
                    : "Até 300MB • vertical 9:16 recomendado"}
                </span>
              </button>
            )}

            <div className="space-y-2">
              <Label htmlFor="post-caption">Legenda</Label>
              <Textarea
                id="post-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva a legenda do post..."
                rows={3}
                maxLength={2200}
              />
            </div>
          </section>

          {/* Step 2 — products */}
          <section className="space-y-3">
            <SectionTitle n={2} title="Produtos da promoção">
              {selectedProductIds.length > 0 && (
                <Badge variant="secondary">{selectedProductIds.length} selecionado(s)</Badge>
              )}
            </SectionTitle>
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

            <ScrollArea className="h-[220px] rounded-md border">
              <div className="space-y-1 p-2">
                {productsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
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

          {/* Step 3 — window + cart */}
          <section className="space-y-3">
            <SectionTitle n={3} title="Janela e carrinho" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cp-starts">Início (opcional)</Label>
                <Input id="cp-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                <p className="text-xs text-muted-foreground">Vazio = começa agora.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-ends">Término (opcional)</Label>
                <Input id="cp-ends" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                <p className="text-xs text-muted-foreground">Vazio = até encerrar manualmente.</p>
              </div>
            </div>
            {windowInvalid && (
              <p className="text-sm text-destructive">O término deve ser depois do início.</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Expiração do carrinho</Label>
                <Select
                  value={cartExpirationMinutes === null ? "inherit" : String(cartExpirationMinutes)}
                  onValueChange={(v) => setCartExpirationMinutes(v === "inherit" ? null : parseInt(v, 10))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>Máximo por item</Label>
                <Select
                  value={maxQty === null ? "inherit" : String(maxQty)}
                  onValueChange={(v) => setMaxQty(v === "inherit" ? null : parseInt(v, 10))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Usar padrão da loja</SelectItem>
                    <SelectItem value="1">1 unidade</SelectItem>
                    <SelectItem value="3">3 unidades</SelectItem>
                    <SelectItem value="5">5 unidades</SelectItem>
                    <SelectItem value="10">10 unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? mediaType === "reel"
                ? "Publicando reel..."
                : "Publicando..."
              : "Publicar e criar evento"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </span>
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
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
