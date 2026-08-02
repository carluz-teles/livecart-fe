"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, Plus, Instagram } from "lucide-react"
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
import {
  InstagramMediaPicker,
  sessionTypeFromMediaType,
} from "./InstagramMediaPicker"
import type { SessionType } from "@/lib/event-kind"
import type { InstagramMediaPost } from "@/types"

/** Valor do select de live quando o lojista escolhe não vincular agora. */
const LINK_LATER = "__later__"

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova sessão
          </DialogTitle>
          <DialogDescription>
            Adicione uma transmissão a esta campanha. Os carrinhos já abertos continuam
            como estão — a sessão nova soma no mesmo carrinho de cada cliente, e herda a
            lista de produtos do evento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormItem>
              <FormLabel>Plataforma</FormLabel>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <FormDescription>Apenas Instagram e suportado no momento</FormDescription>
            </FormItem>

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
                      {SESSION_COPY.media.label}
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
                        {lives.map((live) => {
                          const startTime = live.timestamp
                            ? format(new Date(live.timestamp), "HH:mm", { locale: ptBR })
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

            {(sessionType === "post" || sessionType === "reel") && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  {SESSION_COPY.media.label}
                  <FieldHint text={SESSION_COPY.media.hint} />
                </Label>
                <InstagramMediaPicker
                  enabled={open}
                  selected={selectedMedia}
                  onSelect={handleMediaSelect}
                />
                <p className="text-sm text-muted-foreground">{SESSION_COPY.media.help}</p>
              </div>
            )}

            {sessionType === "story" && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm text-muted-foreground">{SESSION_COPY.storyNoPicker}</p>
              </div>
            )}

            {!platformLiveId && (
              <p className="text-sm text-muted-foreground">
                {SESSION_COPY.noMedia.hint}
              </p>
            )}

            <DialogFooter>
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
    </Dialog>
  )
}
