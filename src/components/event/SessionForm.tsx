"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, Plus, Instagram, Upload, Link2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSessionSchema, type CreateSessionFormData } from "@/schemas/event.schema"
import { useCreateSession } from "@/hooks/event"
import { useInstagramLives } from "@/hooks/integration"
import { FieldHint } from "@/components/shared/FieldHint"
import {
  SESSION_COPY,
  SESSION_TYPE_OPTIONS,
  sessionTypeHelp,
} from "@/lib/event-copy"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  InstagramMediaPicker,
  sessionTypeFromMediaType,
} from "./InstagramMediaPicker"
import { CreatePostForm } from "./CreatePostForm"
import type { SessionType } from "@/lib/event-kind"
import type { InstagramMediaPost } from "@/types"

/** Valor do select de live quando o lojista escolhe não vincular agora. */
const LINK_LATER = "__later__"

/** Rótulo do botão de publicar, por espécie. */
function publishLabel(type: string): string {
  if (type === "reel") return "Publicar um Reel"
  if (type === "story") return "Publicar um Story"
  return "Publicar um post"
}

/** O que cada espécie exige do comprador — a diferença que decide a venda. */
function publishHelp(type: string): string {
  if (type === "reel")
    return "Envie o vídeo e escolha os produtos. O LiveCart publica o Reel e os comentários dele viram carrinho."
  if (type === "story")
    return "Envie a mídia e escolha os produtos. O LiveCart publica o Story — e a venda acontece quando o comprador RESPONDE o story por DM."
  return "Envie a imagem e escolha os produtos. O LiveCart publica o post e os comentários dele viram carrinho."
}

interface SessionFormProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Adicionar uma transmissão a uma campanha que já existe.
 *
 * Este é o fluxo que dá sentido ao evento guarda-chuva, e ele estava
 * inutilizável para publicação: para vincular um post o lojista tinha que
 * digitar o id numérico da mídia ("Ex: 18043029837128493"), um número que o
 * painel não mostra em lugar nenhum. Agora usa a MESMA grade de publicações do
 * caminho de post — e a mídia deixou de ser obrigatória, porque marcar a
 * campanha antes de a transmissão existir é o caso central do modelo.
 */
export function SessionForm({ eventId, open, onOpenChange, onSuccess }: SessionFormProps) {
  const createSession = useCreateSession()
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaPost | null>(null)
  // "publish" primeiro porque é o caminho que faltava e o que o lojista procura
  // quando escolhe post/reel: ele quer PUBLICAR, não caçar um id de mídia.
  const [mediaMode, setMediaMode] = useState<"publish" | "existing">("publish")
  const [publishOpen, setPublishOpen] = useState(false)

  const form = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      platform: "instagram",
      type: "live",
      platformLiveId: "",
    },
  })

  useEffect(() => {
    if (!open) return
    setSelectedMedia(null)
    setMediaMode("publish")
    form.reset({ platform: "instagram", type: "live", platformLiveId: "" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isPending = createSession.isPending
  const sessionType = form.watch("type") ?? "live"
  const platformLiveId = form.watch("platformLiveId")

  // Instagram lives dropdown
  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  const handleTypeChange = (next: string) => {
    form.setValue("type", next as SessionType)
    form.setValue("platformLiveId", "")
    setSelectedMedia(null)
  }

  const handleMediaSelect = (post: InstagramMediaPost) => {
    setSelectedMedia(post)
    form.setValue("platformLiveId", post.id)
    form.setValue("type", sessionTypeFromMediaType(post.media_type))
  }

  async function onSubmit(data: CreateSessionFormData) {
    const mediaId = data.platformLiveId?.trim() || undefined
    createSession.mutate(
      {
        eventId,
        payload: {
          // O backend recusa meia mídia (400 SESSION_MEDIA_INCOMPLETE): ou o
          // par plataforma+id vem junto, ou nenhum dos dois.
          platform: mediaId ? "instagram" : undefined,
          platformLiveId: mediaId,
          // Sem `type` o backend grava 'live'. Como post/reel/story agora SÃO
          // sessões, omitir aqui fazia toda transmissão nascer rotulada
          // errado — e a métrica por sessão herdava o rótulo errado junto.
          type: data.type ?? "live",
          // Metadados só existem quando a mídia veio da grade. Sem eles a
          // sessão nasce sem permalink nem thumbnail, enquanto a MESMA
          // publicação criada como evento novo nasce com tudo.
          mediaPermalink: selectedMedia?.permalink,
          mediaThumbnailUrl: selectedMedia?.thumbnail_url || selectedMedia?.media_url,
          mediaCaption: selectedMedia?.caption,
        },
      },
      {
        onSuccess: () => {
          toast.success("Transmissão adicionada à campanha!", {
            description: mediaId
              ? "Os comentários já começam a virar carrinho."
              : "Ela ainda não captura nada — vincule a publicação quando ela existir.",
          })
          form.reset()
          setSelectedMedia(null)
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao criar sessao", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Mesma estrutura do EventForm: o scroll fica num filho, não no diálogo
          inteiro — senão o rodapé com "Criar sessão" rola para fora da tela. */}
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[560px]">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova sessão
            {/* A regra inteira mora no "?", não num parágrafo: quem já conhece o
                modelo não precisa relê-la a cada sessão criada. */}
            <FieldHint text={SESSION_COPY.bornOpen.hint} />
          </DialogTitle>
          <DialogDescription>
            Adicione uma transmissão a esta campanha. Os carrinhos já abertos continuam
            como estão. {SESSION_COPY.bornOpen.short}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    {SESSION_COPY.type.label}
                    <FieldHint text={SESSION_COPY.type.hint} />
                  </FormLabel>
                  <Select onValueChange={handleTypeChange} value={field.value ?? "live"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SESSION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* A ajuda muda com a opção porque a diferença que importa
                      não é o rótulo: no Story a venda só acontece se o
                      comprador RESPONDER o story. Sem esse aviso o lojista
                      divulga errado e a sessão não converte nada. */}
                  <FormDescription>{sessionTypeHelp(field.value ?? "live")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Markup puro, não FormItem/FormLabel/FormDescription: este bloco é
                decorativo — não há campo de formulário "plataforma", porque só
                existe um valor possível. FormLabel e FormDescription chamam
                useFormField(), que EXIGE o contexto de um <FormField> e explode
                com "useFormField should be used within <FormField>" quando não
                acha. O sheet inteiro morria em "Erro ao carregar" por causa
                deste rótulo. */}
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas Instagram é suportado no momento
              </p>
            </div>

            {/* A mídia de uma live é escolhida entre as transmissões no ar; a
                de uma publicação vem da grade do perfil. Oferecer a lista de
                lives para uma sessão de post vincularia a mídia errada — e o
                vínculo é único por evento ativo. */}
            {sessionType === "live" && (
              <FormField
                control={form.control}
                name="platformLiveId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      {SESSION_COPY.media.liveLabel}
                      <FieldHint text={SESSION_COPY.media.hint} />
                    </FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === LINK_LATER ? "" : v)}
                      value={field.value || LINK_LATER}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={livesLoading ? "Carregando..." : "Selecione uma live"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LINK_LATER}>{SESSION_COPY.media.later}</SelectItem>
                        {lives
                          // Item sem value derruba o Radix com exceção, e a
                          // tela inteira cai no boundary de erro em vez de
                          // mostrar um select vazio.
                          .filter((live) => !!live.id)
                          .map((live) => {
                          // format() lança RangeError em data inválida. Um
                          // horário estranho vindo do Instagram não pode
                          // derrubar a página de criar sessão.
                          const parsed = live.timestamp ? new Date(live.timestamp) : null
                          const startTime =
                            parsed && !Number.isNaN(parsed.getTime())
                              ? format(parsed, "HH:mm", { locale: ptBR })
                              : null
                          return (
                            <SelectItem key={live.id} value={live.id}>
                              Live @{live.username}
                              {startTime && ` (iniciada às ${startTime})`}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription>{SESSION_COPY.media.help}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {sessionType !== "live" && (
              <div className="space-y-3">
                {/* DOIS caminhos, e o de publicar faltava.
                    Só existia "vincular publicação existente", então não havia
                    como fazer um post ou um Reel PELO LiveCart dentro de um
                    evento — o formulário de publicar existia, mas só era
                    alcançável pelo fluxo antigo, que criava evento próprio. */}
                <Tabs
                  value={mediaMode}
                  onValueChange={(v) => setMediaMode(v as "publish" | "existing")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="publish">
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Publicar agora
                    </TabsTrigger>
                    <TabsTrigger value="existing">
                      <Link2 className="mr-1.5 h-3.5 w-3.5" />
                      Já publiquei
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="publish" className="mt-3 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {publishHelp(sessionType)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setPublishOpen(true)}
                    >
                      <Upload className="mr-1.5 h-4 w-4" />
                      {publishLabel(sessionType)}
                    </Button>
                  </TabsContent>

                  <TabsContent value="existing" className="mt-3 space-y-2">
                    <Label className="flex items-center gap-1.5">
                      {SESSION_COPY.media.label}
                      <FieldHint text={SESSION_COPY.media.hint} />
                    </Label>
                    {/* O picker filtra pela espécie escolhida: escolher Reels e
                        receber a grade de posts é o que fazia o lojista vincular
                        a mídia errada. */}
                    <InstagramMediaPicker
                      enabled={open && mediaMode === "existing"}
                      selected={selectedMedia}
                      onSelect={handleMediaSelect}
                      filterType={sessionType === "reel" ? "reel" : "post"}
                    />
                    <p className="text-sm text-muted-foreground">{SESSION_COPY.media.help}</p>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {!platformLiveId && (
              <p className="text-sm text-muted-foreground">
                {SESSION_COPY.noMedia.hintForm}
              </p>
            )}

            </div>

            <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Criando..." : "Criar sessão"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Publicar pelo LiveCart, DENTRO deste evento.
          Ao publicar, o backend já cria a sessão vinculada à mídia — por isso
          aqui só fechamos os dois diálogos e avisamos quem nos abriu. Criar a
          sessão de novo pelo formulário duplicaria a transmissão. */}
      <CreatePostForm
        open={publishOpen}
        variant={sessionType === "reel" ? "reel" : sessionType === "story" ? "story" : "post"}
        eventId={eventId}
        onClose={() => setPublishOpen(false)}
        onSuccess={() => {
          setPublishOpen(false)
          onOpenChange(false)
          onSuccess?.()
        }}
      />
    </Dialog>
  )
}
