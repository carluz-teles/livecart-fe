"use client"

import { useRef, useState } from "react"
import { Check, Film, ImagePlus, Loader2, Package, Search, X } from "lucide-react"
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
import {
  useCreateInstagramPost,
  useCreateInstagramReel,
  useCreateInstagramStory,
} from "@/hooks/event"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface CreatePostFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  // "post" publishes to the feed (photo/Reels, buyers comment to buy); "story"
  // publishes a 24h Story (buyers reply via DM to buy). The form reuses the same
  // media + products UI, hiding the caption/window for Stories.
  variant?: "post" | "story"
}

export function CreatePostForm({ open, onClose, onSuccess, variant = "post" }: CreatePostFormProps) {
  const isStory = variant === "story"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  // Stable per selected media: sent with every submit so a retry after a client
  // timeout dedupes server-side instead of publishing the same post twice.
  const idempotencyKeyRef = useRef("")
  const [mayHavePublished, setMayHavePublished] = useState(false)
  // Publish lifecycle: "uploading" has a real percentage (client→server upload),
  // then "processing" is indeterminate (Instagram has no progress to report).
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing">("idle")
  const [uploadPercent, setUploadPercent] = useState(0)
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

  // Only promotable products: active AND in stock (you can't sell what's out of
  // stock). Ordered by name so it reads like a catalog and a product's variants
  // (which share the same base name) sit together.
  const { data: productsData, isLoading: productsLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"], stockMin: 1 },
    sorting: { sortBy: "name", sortOrder: "asc" },
  })
  const createPost = useCreateInstagramPost()
  const createReel = useCreateInstagramReel()
  const createStory = useCreateInstagramStory()
  const isPending = createPost.isPending || createReel.isPending || createStory.isPending
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
    submittingRef.current = false
    setMayHavePublished(false)
    setPhase("idle")
    setUploadPercent(0)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset()
      onClose()
    }
  }

  // Single media picker: the type is auto-detected from the file. An image
  // becomes a feed photo; a video becomes a Reel. The merchant doesn't choose.
  const pickFile = (f: File | undefined) => {
    if (!f) return
    if (f.type === "image/jpeg") {
      if (f.size > 8 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo de 8MB.")
        return
      }
      setMediaType("image")
    } else if (f.type === "video/mp4" || f.type === "video/quicktime") {
      const maxMB = isStory ? 100 : 300
      if (f.size > maxMB * 1024 * 1024) {
        toast.error(`Vídeo muito grande. Máximo de ${maxMB}MB.`)
        return
      }
      setMediaType("reel")
    } else {
      toast.error("Envie uma foto (JPEG) ou um vídeo (MP4).")
      return
    }
    setFile(f)
    // New media → new idempotency key (one publishable post per selected file).
    idempotencyKeyRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
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

  const action = isStory ? "responde o Story por DM com" : "comenta"
  const ruleHint =
    selectedProductIds.length === 1
      ? isStory
        ? 'Com 1 produto, responder o Story com "EU QUERO" já adiciona ao carrinho.'
        : 'Com 1 produto, um comentário "EU QUERO" já adiciona ao carrinho.'
      : selectedProductIds.length > 1
        ? `Com vários produtos, o cliente ${action} a palavra-chave (ex: "EU QUERO 1005").`
        : "Selecione os produtos que farão parte desta promoção."

  const handleSubmit = () => {
    if (!file || submittingRef.current) return
    if (windowInvalid) {
      toast.error("A data de término deve ser depois da data de início.")
      return
    }
    // Hard guard against a double submit: publishing is slow, and a second
    // submission would publish a second post + create a second event.
    submittingRef.current = true
    setPhase("uploading")
    setUploadPercent(0)
    const payload = {
      file,
      caption: caption.trim() || undefined,
      title: title.trim() || undefined,
      productIds: selectedProductIds,
      startsAt: toISO(startsAt),
      endsAt: toISO(endsAt),
      cartExpirationMinutes,
      cartMaxQuantityPerItem: maxQty,
      idempotencyKey: idempotencyKeyRef.current || undefined,
      onProgress: (pct: number) => {
        setUploadPercent(pct)
        // Upload done → the server is now publishing/processing (no percentage).
        if (pct >= 100) setPhase("processing")
      },
    }
    const callbacks = {
      // Success/error toasts come from the global MutationCache (meta-driven), so
      // they still fire if the merchant closed this dialog mid-publish. Here we
      // only handle the in-form UI for when the dialog is still open.
      onSuccess: () => {
        reset()
        onClose()
        onSuccess?.()
      },
      onError: () => {
        submittingRef.current = false
        setPhase("idle")
        setUploadPercent(0)
        // The request may have failed after the post already went live (e.g. a
        // client timeout). Don't offer an in-place retry — warn and let them
        // verify/close. The error toast itself is shown globally.
        setMayHavePublished(true)
      },
    }
    if (isStory) {
      createStory.mutate(payload, callbacks)
    } else if (mediaType === "reel") {
      createReel.mutate(payload, callbacks)
    } else {
      createPost.mutate(payload, callbacks)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isStory ? "Criar um Story no Instagram" : "Criar post no Instagram"}</SheetTitle>
          <SheetDescription>
            {isStory
              ? "Publique um Story (foto ou vídeo) pelo LiveCart. Ele fica no ar por 24h e quem responder o Story por DM compra na hora."
              : "Publique um post de foto direto pelo LiveCart e já comece a vender pelos comentários — sem sair daqui."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Step 1 — media + caption */}
          <section className="space-y-3">
            <SectionTitle n={1} title={isStory ? "Mídia do Story" : "Mídia e legenda"} />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,video/mp4"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            {previewUrl ? (
              <div className="space-y-2">
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
                {/* Let the merchant know how it will be published. */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    {mediaType === "image" ? (
                      <ImagePlus className="h-3 w-3" />
                    ) : (
                      <Film className="h-3 w-3" />
                    )}
                    {isStory
                      ? mediaType === "image"
                        ? "Story (foto)"
                        : "Story (vídeo)"
                      : mediaType === "image"
                        ? "Foto no feed"
                        : "Reels (vídeo)"}
                  </Badge>
                  <span>
                    {isStory
                      ? "fica no ar por 24h no seu Story."
                      : mediaType === "image"
                        ? "será publicado como foto no feed."
                        : "vídeos viram Reels no Instagram."}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <ImagePlus className="h-7 w-7 text-muted-foreground/60" />
                <span className="text-sm font-medium">
                  Selecionar mídia (foto ou vídeo)
                </span>
                <span className="text-xs text-muted-foreground">
                  {isStory
                    ? "Foto JPEG (até 8MB) ou vídeo MP4 (até 100MB) — detectamos automaticamente."
                    : "Foto JPEG (até 8MB) ou vídeo MP4 (até 300MB) — detectamos automaticamente."}
                </span>
              </button>
            )}

            {/* Stories have no public caption — buyers engage via DM, so skip it. */}
            {!isStory && (
              <div className="space-y-2">
                <Label htmlFor="post-caption">Legenda do post</Label>
                <Textarea
                  id="post-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Esta legenda vai junto com o post no Instagram..."
                  rows={3}
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground">
                  É o texto que aparece no post publicado no Instagram.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="post-title">Título do evento (opcional)</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Promoção da Sexta"
              />
              <p className="text-xs text-muted-foreground">
                Apenas para você identificar o evento no LiveCart.
              </p>
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
            {isStory ? (
              // Stories always run for their fixed 24h lifetime — no custom window.
              <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                ⏳ O Story fica ativo por <span className="font-medium text-foreground">24 horas</span>.
                Depois disso o evento encerra automaticamente.
              </p>
            ) : (
              <>
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
              </>
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

        {isPending && (
          <div className="mt-6 space-y-3 rounded-md border bg-muted/40 p-4 text-sm">
            {phase === "uploading" ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {mediaType === "reel" ? "Enviando o vídeo..." : "Enviando a imagem..."}
                  </p>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {uploadPercent}%
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={uploadPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {mediaType === "reel"
                    ? "Vídeos grandes levam mais tempo no envio. Não feche esta janela."
                    : "Não feche esta janela."}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="font-medium">Processando no Instagram...</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-full animate-pulse rounded-full bg-primary/70" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {mediaType === "reel"
                    ? "O Instagram está processando o vídeo — pode levar alguns minutos."
                    : isStory
                      ? "Publicando o Story — pode levar até 1 minuto."
                      : "Publicando o post — pode levar até 1 minuto."}
                </p>
              </>
            )}
            <p className="border-t pt-2 text-xs text-muted-foreground">
              Pode fechar esta janela — avisaremos por aqui quando a publicação concluir.
            </p>
          </div>
        )}

        {mayHavePublished && !isPending && (
          <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Não recebemos a confirmação do servidor.</p>
            <p>
              {isStory
                ? "O Story pode já ter sido publicado e o evento criado. Confira seu Instagram e a lista de eventos antes de tentar novamente, para não duplicar."
                : "O post pode já ter sido publicado e o evento criado. Confira seu Instagram e a lista de eventos antes de tentar novamente, para não duplicar."}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {isPending || mayHavePublished ? "Fechar" : "Cancelar"}
          </Button>
          {!mayHavePublished && (
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? phase === "uploading"
                  ? `Enviando... ${uploadPercent}%`
                  : "Processando..."
                : "Publicar e criar evento"}
            </Button>
          )}
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
        "flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors",
        selected ? "bg-primary/10" : "hover:bg-muted"
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
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
        {/* Title on its own line so a long name truncates cleanly without
            being squeezed by the variant chips. */}
        <p className="truncate text-sm font-medium leading-tight">
          {product.groupName || product.name}
        </p>
        {/* Variant options wrap on their own line — tidy on mobile too. */}
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
          <span className="whitespace-nowrap">{product.stock} em estoque</span>
        </div>
      </div>
    </button>
  )
}
