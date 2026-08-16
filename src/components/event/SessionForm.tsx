"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ChevronDown,
  Images,
  Link2,
  Loader2,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { createSessionSchema, type CreateSessionFormData } from "@/schemas/event.schema"
import { useCreateSession } from "@/hooks/event"
import { useInstagramLives } from "@/hooks/integration"
import { FormSection } from "@/components/shared/FormSection"
import { ProductMultiSelect } from "@/components/shared/ProductMultiSelect"
import {
  InstagramMediaPicker,
  sessionTypeFromMediaType,
} from "./InstagramMediaPicker"
import { CreatePostForm } from "./CreatePostForm"
import { cn } from "@/lib/utils"
import type { InstagramMediaPost } from "@/types"

interface SessionFormProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/** De onde vem a venda. NÃO é o tipo gravado no banco.
 *
 *  "Reel" saiu daqui de propósito. Para vender, post e reel são a mesma coisa —
 *  `IsPostCommerceSessionType` no backend trata os dois (e o story) igual: mesma
 *  whitelist, mesmo auto-add, mesma resposta privada. A diferença é só o que se
 *  publica (reel é vídeo) e o rótulo. Perguntar "post ou reel?" antes de o
 *  lojista escolher a mídia é pedir que ele classifique algo que o sistema
 *  descobre sozinho — `sessionTypeFromMediaType` deriva do `media_type`. */
const ORIGENS = [
  {
    value: "live" as const,
    label: "Live ao vivo",
    subtitle: "Comentários da live",
    Icon: Radio,
  },
  {
    value: "post" as const,
    label: "Post no feed",
    subtitle: "Comentários do post ou reel",
    Icon: Images,
  },
  {
    value: "story" as const,
    label: "Story",
    subtitle: "Respostas por DM",
    Icon: Sparkles,
  },
]

type Origem = (typeof ORIGENS)[number]["value"]

/**
 * Criação de uma sessão dentro de um evento.
 *
 * O que mudou, e por quê:
 *
 * O select "Live ativa" oferecia "Vincular depois" como se fosse uma escolha
 * entre duas coisas equivalentes. Não era: ou existe uma live no ar, e ela é a
 * resposta, ou não existe, e não há o que escolher. A capacidade de criar a
 * sessão antes da live continua — é o caso central do evento guarda-chuva
 * ("marco a Semana Black hoje e penduro a live de segunda") — mas deixou de ser
 * uma opção de menu e virou o que sempre foi: o estado vazio.
 *
 * Os produtos entram aqui, e não depois. O backend grava sessão e lista na mesma
 * transação; encadear no cliente deixaria a sessão no ar com lista parcial
 * se a segunda chamada falhasse — e falhar na primeira é o pior caso, porque
 * lista vazia significa "vende tudo".
 */
export function SessionForm({ eventId, open, onOpenChange, onSuccess }: SessionFormProps) {
  const createSession = useCreateSession()
  const [origem, setOrigem] = useState<Origem>("live")
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaPost | null>(null)
  const [mediaMode, setMediaMode] = useState<"existing" | "publish">("existing")
  const [publishOpen, setPublishOpen] = useState(false)
  const [productIds, setProductIds] = useState<string[]>([])
  const [productsOpen, setProductsOpen] = useState(false)

  const form = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { platform: "instagram", type: "live", platformLiveId: "" },
  })

  useEffect(() => {
    if (!open) return
    setOrigem("live")
    setSelectedMedia(null)
    // "Já publiquei" primeiro: escolher uma publicação que já existe é o caminho
    // curto. Publicar agora abre outro formulário inteiro.
    setMediaMode("existing")
    // `publishOpen` não era resetado — reabrir o diálogo depois de publicar
    // trazia o sheet de publicação junto, aberto por cima.
    setPublishOpen(false)
    setProductIds([])
    setProductsOpen(false)
    form.reset({ platform: "instagram", type: "live", platformLiveId: "" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isPending = createSession.isPending
  const platformLiveId = form.watch("platformLiveId")

  // Só busca com o diálogo aberto E na aba de live: antes rodava a cada 30s em
  // toda página que monta o formulário, inclusive fechado.
  const {
    data: livesData,
    isLoading: livesLoading,
    isError: livesError,
    refetch: refetchLives,
    isFetching: livesFetching,
  } = useInstagramLives({ enabled: open && origem === "live" })
  const lives = livesData?.data ?? []

  // A live no ar É a resposta — não uma opção entre outras.
  //
  // Idempotente de propósito: não sobrescreve escolha manual quando há mais de
  // uma (queda de rede reabre a transmissão e a conta passa a listar duas), e
  // limpa o campo se a live selecionada sumir do retorno, para nunca criar a
  // sessão apontando para um id morto.
  useEffect(() => {
    if (origem !== "live") return
    if (lives.length === 0) {
      if (platformLiveId) form.setValue("platformLiveId", "")
      return
    }
    const aindaExiste = lives.some((l) => l.id === platformLiveId)
    if (!platformLiveId || !aindaExiste) {
      form.setValue("platformLiveId", lives[0].id)
    }
    // `open` entra aqui junto com os dados: ao reabrir o diálogo o efeito de
    // reset limpa o campo, e sem esta dependência este aqui não roda de novo
    // (origem e livesData vêm iguais, do cache). A live aparecia na tela com o
    // campo vazio, e a sessão nascia sem vínculo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origem, livesData, open])

  function trocarOrigem(next: Origem) {
    setOrigem(next)
    setSelectedMedia(null)
    setMediaMode("existing")
    setProductIds([])
    setProductsOpen(false)
    form.setValue("platformLiveId", "")
    form.setValue("type", next === "live" ? "live" : next === "story" ? "story" : "post")
  }

  function selecionarMidia(post: InstagramMediaPost) {
    setSelectedMedia(post)
    form.clearErrors("platformLiveId")
    form.setValue("platformLiveId", post.id)
    // O tipo é DERIVADO da mídia — é o único lugar onde o lojista lê a espécie,
    // e ele a lê como fato, não como pergunta.
    form.setValue("type", sessionTypeFromMediaType(post.media_type))
  }

  // Story tem UM caminho só: publicar pelo LiveCart.
  //
  // A condição olhava `mediaMode`, e story não mostra as abas — então o modo
  // ficava no padrão "existing" e o botão criava uma sessão vazia em vez de
  // abrir a publicação. O lojista clicava em Story, aparecia uma sessão, e não
  // havia como publicar nada.
  const publicando =
    origem === "story" || (origem === "post" && mediaMode === "publish")

  function onSubmit(data: CreateSessionFormData) {
    // Sessão de live sem live no ar não captura nada: o vínculo é o que faz o
    // comentário virar carrinho, e sem ele a sessão fica muda até alguém
    // lembrar de voltar e vincular à mão.
    if (origem === "live" && !platformLiveId) {
      form.setError("platformLiveId", {
        message: "Comece a live no Instagram para criar a sessão.",
      })
      return
    }
    if (publicando) {
      setPublishOpen(true)
      return
    }
    // Post sem publicação escolhida nasce sem capturar nada — e, diferente da
    // live, aqui não é um caso legítimo: a grade está na tela e a publicação já
    // existe. Criar assim daria uma sessão muda, com falha silenciosa.
    if (origem === "post" && !selectedMedia) {
      form.setError("platformLiveId", { message: "Escolha uma publicação." })
      return
    }
    const mediaId = data.platformLiveId?.trim() || undefined
    createSession.mutate(
      {
        eventId,
        payload: {
          // O backend recusa meia mídia (SESSION_MEDIA_INCOMPLETE): ou o par
          // plataforma+id vem junto, ou nenhum dos dois.
          platform: mediaId ? "instagram" : undefined,
          platformLiveId: mediaId,
          type: data.type ?? "live",
          mediaPermalink: selectedMedia?.permalink,
          mediaThumbnailUrl: selectedMedia?.thumbnail_url || selectedMedia?.media_url,
          mediaCaption: selectedMedia?.caption,
          // Omitido quando vazio: omitido significa "vende qualquer produto
          // ativo da loja", e mandar `[]` diria a mesma coisa por um caminho
          // que o backend não precisa distinguir.
          productIds: productIds.length > 0 ? productIds : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sessão criada", {
            description: mediaId
              ? "Os comentários já viram carrinho."
              : "Vincule a publicação pela aba Sessões.",
          })
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Não foi possível criar a sessão", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      },
    )
  }

  // Sem live no ar não há sessão de live a criar. Vale também quando a consulta
  // falha: aí não sabemos se existe live, e afirmar que não existe seria criar
  // uma sessão muda por adivinhação. O painel traz "Tentar de novo" para sair
  // do estado.
  const semLiveParaVincular = origem === "live" && !platformLiveId

  const rotuloPrimario = publicando
    ? origem === "story"
      ? "Publicar um Story"
      : "Publicar um post"
    : isPending
      ? "Criando..."
      : "Criar sessão"

  return (
    <>
      {/* O diálogo SOME enquanto o sheet de publicação está aberto, em vez de
          ficar montado atrás dele.
          Um Dialog do Radix em modo modal aplica `pointer-events: none` fora do
          próprio conteúdo. Com o sheet aberto por cima, os cliques dentro dele
          — inclusive o que abre o seletor de arquivo — morriam antes de chegar,
          e o lojista via a tela de publicar sem conseguir anexar nada.
          `open` (a prop) continua verdadeiro, então o componente não desmonta e
          o efeito de reset não dispara: fechar o sheet devolve o diálogo com
          tudo preenchido. */}
    <Dialog open={open && !publishOpen} onOpenChange={onOpenChange}>
      {/* O scroll fica num filho, não no diálogo inteiro — senão o rodapé com o
          botão primário rola para fora da tela. */}
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px]">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova sessão
          </DialogTitle>
          <DialogDescription>
            Tudo que ela vender cai no mesmo carrinho do cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-6">
              <FormSection
                first
                title="Tipo da sessão"
                hint="Live e post vendem pelo comentário. Story vende quando o cliente responde por DM."
              >
                {/* Cartões, não select: os três subtítulos respondem à mesma
                    pergunta — por onde o cliente compra — que é a única
                    diferença que o lojista precisa reter. Num select, essa
                    resposta virava um parágrafo abaixo do campo. */}
                <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
                  {ORIGENS.map(({ value, label, subtitle, Icon }) => {
                    const ativo = origem === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={ativo}
                        onClick={() => trocarOrigem(value)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors sm:flex-col sm:gap-2",
                          ativo
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-primary/40 hover:bg-muted/50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            ativo ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{label}</p>
                          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                            {subtitle}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </FormSection>

              {origem === "live" && (
                <FormSection
                  title="Live no Instagram"
                  hint="Uma publicação só pode estar em um evento ativo por vez."
                >
                  <LiveSlot
                    loading={livesLoading}
                    error={livesError}
                    refetching={livesFetching}
                    lives={lives}
                    selectedId={platformLiveId ?? ""}
                    onSelect={(id) => form.setValue("platformLiveId", id)}
                    onRetry={() => refetchLives()}
                  />
                </FormSection>
              )}

              {origem !== "live" && (
                <FormSection
                  title="Publicação"
                  hint="Uma publicação só pode estar em um evento ativo por vez."
                >
                  {origem === "story" ? (
                    // Story não tem grade: o Instagram não lista stories. E a
                    // frase é permanente porque errar isso é divulgar a venda
                    // errado — o cliente comenta e nada acontece.
                    <PainelInfo
                      icon={<Upload className="h-5 w-5 text-muted-foreground" />}
                      title="O LiveCart publica o Story"
                      body="A venda acontece quando o cliente RESPONDE o story por DM. Comentário não existe em story."
                    />
                  ) : selectedMedia ? (
                    <MidiaEscolhida
                      media={selectedMedia}
                      onTrocar={() => {
                        setSelectedMedia(null)
                        form.setValue("platformLiveId", "")
                      }}
                    />
                  ) : (
                    <Tabs
                      value={mediaMode}
                      onValueChange={(v) => setMediaMode(v as "existing" | "publish")}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existing">
                          <Link2 className="mr-1.5 h-3.5 w-3.5" />
                          Já publiquei
                        </TabsTrigger>
                        <TabsTrigger value="publish">
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          Publicar agora
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="existing" className="mt-3">
                        {/* Sem `filterType`: a grade mistura post, carrossel e
                            reel, e o tipo sai do que for escolhido. */}
                        <InstagramMediaPicker
                          enabled={open && mediaMode === "existing"}
                          selected={selectedMedia}
                          onSelect={selecionarMidia}
                        />
                        {form.formState.errors.platformLiveId && (
                          <p className="mt-2 text-sm text-destructive">
                            {form.formState.errors.platformLiveId.message}
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="publish" className="mt-3">
                        <PainelInfo
                          icon={<Upload className="h-5 w-5 text-muted-foreground" />}
                          title="Publicar pelo LiveCart"
                          body="Foto vira post no feed; vídeo vira Reel. Você envia a mídia e escolhe os produtos no próximo passo."
                        />
                      </TabsContent>
                    </Tabs>
                  )}
                </FormSection>
              )}

              {/* Produtos só quando há uma publicação escolhida.
                  Na aba de publicar, o CreatePostForm já coleta e EXIGE a lista;
                  duas listas para a mesma sessão seriam o "tudo muito junto" de
                  volta. */}
              {origem !== "live" && selectedMedia && (
                <FormSection
                  title="Produtos"
                  hint="Sem seleção, esta sessão vende qualquer produto ativo da loja."
                >
                  <Collapsible open={productsOpen} onOpenChange={setProductsOpen}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Produtos desta sessão</p>
                        <p className="text-xs text-muted-foreground">
                          {productIds.length === 0
                            ? "Todos os produtos da loja"
                            : productIds.length === 1
                              ? "1 produto selecionado"
                              : `${productIds.length} produtos selecionados`}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          productsOpen && "rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      {productIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setProductIds([])}
                          className="mb-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Limpar seleção
                        </button>
                      )}
                      <ProductMultiSelect value={productIds} onChange={setProductIds} />
                    </CollapsibleContent>
                  </Collapsible>
                </FormSection>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || semLiveParaVincular}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {rotuloPrimario}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

    </Dialog>

      {/* Fora do Dialog de propósito — ver o comentário acima.
          Publicar pelo LiveCart, DENTRO deste evento: o backend já cria a sessão
          vinculada à mídia, então aqui só fechamos os dois — criar a sessão de
          novo duplicaria a sessão. */}
      <CreatePostForm
        open={publishOpen}
        variant={origem === "story" ? "story" : "post"}
        eventId={eventId}
        onClose={() => setPublishOpen(false)}
        onSuccess={() => {
          setPublishOpen(false)
          onOpenChange(false)
          onSuccess?.()
        }}
      />
    </>
  )
}

/** Bloco informativo com moldura tracejada: informa, não pede decisão. */
function PainelInfo({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/40 p-6 text-center">
      {icon}
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{body}</p>
      {action}
    </div>
  )
}

/**
 * A live no ar, ou a informação de que não há nenhuma.
 *
 * Com uma live é INFORMAÇÃO, não controle — não há o que escolher, então não é
 * clicável. Com duas ou mais (queda de rede reabre a transmissão e a conta passa
 * a listar as duas) vira lista selecionável, com a mais recente já marcada.
 */
function LiveSlot({
  loading,
  error,
  refetching,
  lives,
  selectedId,
  onSelect,
  onRetry,
}: {
  loading: boolean
  error: boolean
  refetching: boolean
  lives: { id: string; username?: string; startedAt?: string }[]
  selectedId: string
  onSelect: (id: string) => void
  onRetry: () => void
}) {
  if (loading) return <Skeleton className="h-[76px] w-full rounded-lg" />

  if (error) {
    return (
      <PainelInfo
        icon={<Radio className="h-5 w-5 text-muted-foreground" />}
        title="Não conseguimos falar com o Instagram"
        body="Sem confirmar a live no ar não dá para criar a sessão — ela nasceria sem capturar comentário nenhum."
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tentar de novo
          </Button>
        }
      />
    )
  }

  if (lives.length === 0) {
    return (
      <PainelInfo
        icon={<Radio className="h-5 w-5 text-muted-foreground" />}
        title="Nenhuma live no ar agora"
        body="Comece a transmissão no Instagram e procure de novo. A sessão de live precisa da live no ar para capturar os comentários."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={refetching}
          >
            {refetching && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {refetching ? "Procurando..." : "Procurar de novo"}
          </Button>
        }
      />
    )
  }

  const unica = lives.length === 1

  return (
    <div className="space-y-2" aria-live="polite">
      {lives.map((live) => {
        const ativo = live.id === selectedId
        return (
          <div
            key={live.id}
            role={unica ? undefined : "radio"}
            aria-checked={unica ? undefined : ativo}
            tabIndex={unica ? undefined : 0}
            onClick={unica ? undefined : () => onSelect(live.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3",
              ativo ? "border-primary bg-primary/5" : "hover:bg-muted/50",
              !unica && "cursor-pointer",
            )}
          >
            <Badge className="gap-1.5 bg-red-500 hover:bg-red-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              AO VIVO
            </Badge>
            <div className="min-w-0 flex-1">
              {live.username && (
                <p className="truncate text-sm font-medium">@{live.username}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatarInicio(live.startedAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Resumo da publicação escolhida, com o tipo derivado e a saída para trocar. */
function MidiaEscolhida({
  media,
  onTrocar,
}: {
  media: InstagramMediaPost
  onTrocar: () => void
}) {
  const tipo = sessionTypeFromMediaType(media.media_type)
  const thumb = media.thumbnail_url || media.media_url
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary bg-primary/5 p-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm leading-snug">
            {media.caption || "Sem legenda"}
          </p>
          <Badge variant="secondary" className="shrink-0">
            {tipo === "reel" ? "Reel" : "Post"}
          </Badge>
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={onTrocar}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Trocar
          </button>
          {media.permalink && (
            <a
              href={media.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Ver no Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/** Timestamp inválido omite a hora em vez de derrubar o diálogo com RangeError. */
function formatarInicio(startedAt?: string): string {
  if (!startedAt) return "No ar agora"
  const d = new Date(startedAt)
  if (Number.isNaN(d.getTime())) return "No ar agora"
  return `No ar desde ${format(d, "HH:mm", { locale: ptBR })}`
}
