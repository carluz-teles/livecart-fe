"use client"

import { useMemo } from "react"
import {
  Check,
  ExternalLink,
  Image as ImageIcon,
  Instagram,
  Loader2,
  MessageCircle,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useInstagramMedia } from "@/hooks/integration"
import { cn } from "@/lib/utils"
import type { InstagramMediaPost } from "@/types"

/**
 * Grade de publicações do Instagram, reaproveitável.
 *
 * Existia só dentro do `PostEventForm`. Enquanto isso, para adicionar uma
 * sessão de post a uma campanha já criada, o `SessionForm` pedia o id numérico
 * da mídia ("Ex: 18043029837128493") — um número que o painel nunca mostra em
 * lugar nenhum. Na prática o caminho novo (criar a campanha e pendurar as
 * transmissões depois), que é o modelo inteiro do evento guarda-chuva, era
 * inutilizável para publicação. Extrair a grade é o que torna os dois caminhos
 * equivalentes.
 */

const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  CAROUSEL_ALBUM: "Carrossel",
  REELS: "Reel",
  REEL: "Reel",
}

/**
 * Espécie da sessão a partir do `media_type` que o Instagram devolve.
 *
 * O card da grade sempre soube dizer "Reel", mas o evento nascia com sessão
 * `post` porque a rota não carregava o tipo. Resultado: o MESMO reel publicado
 * pelo LiveCart virava `reel` e escolhido na grade virava `post` — e o rótulo
 * errado vazava para a métrica por transmissão e para a DM do comprador.
 */
export function sessionTypeFromMediaType(mediaType: string | undefined): "post" | "reel" {
  const normalized = (mediaType ?? "").toUpperCase()
  return normalized === "REELS" || normalized === "REEL" ? "reel" : "post"
}

interface InstagramMediaPickerProps {
  /** Só busca quando o container está aberto — evita chamar a Graph API atrás de um Sheet fechado. */
  enabled?: boolean
  selected: InstagramMediaPost | null
  onSelect: (post: InstagramMediaPost) => void
  /** Resumo da mídia escolhida abaixo da grade. */
  showSelectedSummary?: boolean
  /** Mostra só as publicações da espécie escolhida.
   *
   *  Sem isto, escolher "Reels" na sessão abria a grade inteira do perfil, com
   *  posts de foto no meio — e vincular um post a uma sessão de Reel grava a
   *  espécie errada, que a métrica por transmissão herda. Ausente = tudo. */
  filterType?: "post" | "reel"
}

export function InstagramMediaPicker({
  enabled = true,
  selected,
  onSelect,
  showSelectedSummary = true,
  filterType,
}: InstagramMediaPickerProps) {
  const media = useInstagramMedia(enabled)
  const posts = useMemo(() => {
    const all = media.data?.pages.flatMap((p) => p.data) ?? []
    if (!filterType) return all
    return all.filter((p) => sessionTypeFromMediaType(p.media_type) === filterType)
  }, [media.data, filterType])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
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

      <InstagramMediaGrid
        posts={posts}
        loading={media.isLoading}
        error={media.isError}
        selectedId={selected?.id ?? null}
        onSelect={onSelect}
      />

      {media.hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => media.fetchNextPage()}
            disabled={media.isFetchingNextPage}
          >
            {media.isFetchingNextPage && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Carregar mais posts
          </Button>
        </div>
      )}

      {showSelectedSummary && selected && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
          <InstagramMediaThumb post={selected} className="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {selected.caption || "Publicação sem legenda"}
            </p>
            <p className="text-xs text-muted-foreground">
              {MEDIA_TYPE_LABELS[selected.media_type] || "Post"} selecionado
            </p>
          </div>
          {selected.permalink && (
            <a
              href={selected.permalink}
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
    </div>
  )
}

export function InstagramMediaThumb({
  post,
  className,
}: {
  post: InstagramMediaPost
  className?: string
}) {
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

interface InstagramMediaGridProps {
  posts: InstagramMediaPost[]
  loading: boolean
  error: boolean
  selectedId: string | null
  onSelect: (post: InstagramMediaPost) => void
}

export function InstagramMediaGrid({
  posts,
  loading,
  error,
  selectedId,
  onSelect,
}: InstagramMediaGridProps) {
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
        const isSelected = post.id === selectedId
        return (
          <button
            type="button"
            key={post.id}
            onClick={() => onSelect(post)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-md border transition-all",
              isSelected
                ? "border-primary ring-2 ring-primary"
                : "border-transparent hover:border-muted-foreground/30"
            )}
            aria-pressed={isSelected}
          >
            <InstagramMediaThumb post={post} className="h-full w-full rounded-none" />

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

            {isSelected && (
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
