"use client"

import { useRef, useState } from "react"
import { Film, ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ProductMultiSelect } from "@/components/shared/ProductMultiSelect"
import { FieldHint } from "@/components/shared/FieldHint"
import {
  EVENT_COPY,
  defaultEndsAtLocal,
  isLongCampaign,
  LONG_CAMPAIGN_WARNING,
} from "@/lib/event-copy"

interface CreatePostFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  // "post" publishes to the feed (photo, buyers comment to buy); "reel" publishes
  // a Reels video; "story" publishes a 24h Story (buyers reply via DM to buy).
  // The form reuses the same media + products UI, hiding the caption/window for
  // Stories.
  variant?: "post" | "reel" | "story"
  /** Quando presente, a publicação entra como SESSÃO deste evento em vez de
   *  criar um evento próprio.
   *
   *  É o que liga o "publicar pelo LiveCart" ao guarda-chuva: sem isto, o post
   *  de terça nascia num evento separado da live de segunda e o mesmo comprador
   *  terminava com dois carrinhos. Com o evento, as regras comerciais (janela,
   *  expiração, teto) são DELE — por isso os campos somem do formulário. */
  eventId?: string
}

export function CreatePostForm({
  open,
  onClose,
  onSuccess,
  variant = "post",
  eventId,
}: CreatePostFormProps) {
  const isStory = variant === "story"
  // Dentro de um evento, quem manda na janela e nas regras de carrinho é ele.
  const insideEvent = !!eventId
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
  const [mediaType, setMediaType] = useState<"image" | "reel">(
    variant === "reel" ? "reel" : "image"
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [title, setTitle] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [startsAt, setStartsAt] = useState("")
  // Obrigatório também aqui. O Story tem vida de 24h no Instagram, mas o EVENTO
  // do LiveCart não morre com ele: sem ends_at o carrinho gerado pelo Story
  // ficaria sem prazo depois que a mídia já sumiu do perfil.
  const [endsAt, setEndsAt] = useState(defaultEndsAtLocal)
  const [cartExpirationMinutes, setCartExpirationMinutes] = useState<number | null>(null)
  const [maxQty, setMaxQty] = useState<number | null>(null)
  const createPost = useCreateInstagramPost()
  const createReel = useCreateInstagramReel()
  const createStory = useCreateInstagramStory()
  const isPending = createPost.isPending || createReel.isPending || createStory.isPending
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
    setEndsAt(defaultEndsAtLocal())
    setCartExpirationMinutes(null)
    setMaxQty(null)
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

  const toISO = (v: string) => (v ? new Date(v).toISOString() : undefined)
  const windowInvalid = !!startsAt && !!endsAt && new Date(endsAt) <= new Date(startsAt)
  const canSubmit =
    !!file && selectedProductIds.length > 0 && !!endsAt && !windowInvalid && !isPending

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
      // Dentro de um evento, janela e regras de carrinho NÃO são enviadas: são
      // do evento, e mandá-las daqui deixaria uma publicação redefinir a
      // campanha inteira pelas costas.
      ...(insideEvent
        ? { eventId }
        : {
            startsAt: toISO(startsAt),
            endsAt: new Date(endsAt).toISOString(),
            cartExpirationMinutes,
            cartMaxQuantityPerItem: maxQty,
          }),
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
              ? "Atalho: publica o Story (foto ou vídeo) e cria a campanha de uma vez. Ele fica no ar por 24h e quem responder o Story por DM compra na hora — comentar em outro lugar não conta."
              : "Atalho: publica o post pelo LiveCart e cria a campanha de uma vez, já vendendo pelos comentários. Você pode adicionar outras transmissões à mesma campanha depois."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Step 1 — media + caption */}
          <section className="space-y-3">
            <SectionTitle n={1} title={isStory ? "Mídia do Story" : "Mídia e legenda"} />

            <input
              ref={fileInputRef}
              type="file"
              // Tem de casar com o que `pickFile` aceita logo abaixo: ele
              // aprova video/quicktime, mas o `accept` não listava — então o
              // seletor do sistema escondia todo .mov, que é o formato padrão
              // de vídeo do iPhone. O lojista não via o próprio arquivo.
              accept="image/jpeg,image/jpg,video/mp4,video/quicktime"
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
              {/* Os três formulários chamavam este mesmo campo de três coisas
                  diferentes ("Nome da campanha", "Título (opcional)", "Título
                  do evento (opcional)"), e só um deles explicava que é o nome
                  da CAMPANHA. */}
              <Label htmlFor="post-title" className="flex items-center gap-1.5">
                {EVENT_COPY.title.label}
              </Label>
              <Input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={EVENT_COPY.title.placeholder}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. É o nome da campanha que o comprador vê nas mensagens — e esta
                publicação é a primeira transmissão dela.
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

            {/* A lista mora em ProductMultiSelect: ela existia aqui e o
                SessionForm precisou da mesma. Duas cópias divergiriam no
                primeiro ajuste — e este código já teve isso, com "produto
                disponível" definido de dois jeitos na mesma tela.

                `requireStock`: publicar é vender AGORA, então produto sem
                estoque não entra. Configurar uma transmissão é diferente — lá o
                estoque pode voltar antes de a venda começar. */}
            <ProductMultiSelect
              value={selectedProductIds}
              onChange={setSelectedProductIds}
              requireStock
            />
          </section>

          {/* Step 3 — window + cart.
              Some inteira dentro de um evento: janela, expiração e teto são do
              EVENTO. Mostrá-los aqui convidaria o lojista a definir, numa
              publicação, regra que vale para a campanha toda — e a publicação
              nem as envia mais. */}
          {insideEvent ? (
            <section className="space-y-3">
              <SectionTitle n={3} title="Janela e carrinho" />
              <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                Esta publicação entra no evento que você já abriu. O prazo de
                pagamento, a expiração do carrinho e o limite por produto são os
                do evento — e valem igual para todas as transmissões dele.
              </p>
            </section>
          ) : (
          <section className="space-y-3">
            <SectionTitle n={3} title="Janela e carrinho" />
            {isStory && (
              <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                ⏳ A mídia do Story sai do seu perfil em{" "}
                <span className="font-medium text-foreground">24 horas</span>, mas o evento
                do LiveCart continua até a data de fim abaixo — é ela que define quando o
                prazo de pagamento do comprador começa a correr.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cp-starts" className="flex items-center gap-1.5">
                  {EVENT_COPY.startsAt.label}
                  <FieldHint text={EVENT_COPY.startsAt.hint} />
                </Label>
                <Input id="cp-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                <p className="text-xs text-muted-foreground">{EVENT_COPY.startsAt.empty}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-ends" className="flex items-center gap-1.5">
                  {EVENT_COPY.endsAt.label} <span className="text-destructive">*</span>
                  <FieldHint text={EVENT_COPY.endsAt.hint} />
                </Label>
                <Input id="cp-ends" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                <p className="text-xs text-muted-foreground">{EVENT_COPY.endsAt.help}</p>
              </div>
            </div>
            {!endsAt && (
              <p className="text-sm text-destructive">Informe quando a promoção encerra.</p>
            )}
            {windowInvalid && (
              <p className="text-sm text-destructive">O término deve ser depois do início.</p>
            )}
            {isLongCampaign(startsAt || null, endsAt || null) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-xs text-amber-800 dark:text-amber-200">{LONG_CAMPAIGN_WARNING}</p>
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
                <Label className="flex items-center gap-1.5">
                  {EVENT_COPY.maxQuantity.label}
                  <FieldHint text={EVENT_COPY.maxQuantity.hint} />
                </Label>
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
          )}
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

