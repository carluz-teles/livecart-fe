"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Link2, Loader2 } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLinkSessionMedia } from "@/hooks/event"
import { useInstagramLives } from "@/hooks/integration"
import { SESSION_COPY } from "@/lib/event-copy"
import { InstagramMediaPicker } from "./InstagramMediaPicker"
import type { EventSession, InstagramMediaPost } from "@/types"

interface SessionMediaFormProps {
  eventId: string
  /** A transmissão que vai receber a publicação. `null` fecha o diálogo. */
  session: EventSession | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Vincular a publicação a uma transmissão que já existe.
 *
 * Esta tela é a outra metade de "crie a sessão agora e vincule a mídia depois".
 * A primeira metade já existia (a sessão nasce sem mídia e a tabela mostra o
 * badge "Sem publicação vinculada"); a segunda não tinha caminho nenhum no
 * painel — o único vínculo posterior era o "Crash recovery", que só lista lives
 * no ar, só aparece em campanha que já tem live, e escreve na sessão que o
 * backend escolher, não na que o lojista está olhando.
 *
 * O tipo da sessão decide de onde a mídia vem: live sai da lista de
 * transmissões no ar, publicação sai da grade do perfil. Oferecer a lista
 * errada vincularia a mídia errada — e o erro é mudo, o comentário só deixa de
 * virar carrinho.
 */
export function SessionMediaForm({
  eventId,
  session,
  onOpenChange,
  onSuccess,
}: SessionMediaFormProps) {
  const linkMedia = useLinkSessionMedia()
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaPost | null>(null)
  const [liveId, setLiveId] = useState("")

  const open = session !== null
  const isLive = session?.type === "live"
  const isStory = session?.type === "story"

  const { data: livesData, isLoading: livesLoading } = useInstagramLives()
  const lives = livesData?.data ?? []

  useEffect(() => {
    if (!open) return
    setSelectedMedia(null)
    setLiveId("")
  }, [open, session?.id])

  const mediaId = isLive ? liveId : selectedMedia?.id
  const isPending = linkMedia.isPending

  function handleSubmit() {
    if (!session || !mediaId) return
    linkMedia.mutate(
      {
        eventId,
        sessionId: session.id,
        payload: {
          platform: "instagram",
          platformLiveId: mediaId,
          // Só a grade traz metadados. Mandá-los aqui é o que faz a publicação
          // vinculada depois ficar igual à que entrou na criação.
          mediaPermalink: selectedMedia?.permalink,
          mediaThumbnailUrl: selectedMedia?.thumbnail_url || selectedMedia?.media_url,
          mediaCaption: selectedMedia?.caption,
        },
      },
      {
        onSuccess: () => {
          toast.success("Publicação vinculada!", {
            description: "Os comentários desta transmissão já começam a virar carrinho.",
          })
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao vincular a publicação", {
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
            <Link2 className="h-5 w-5" />
            Vincular publicação
          </DialogTitle>
          <DialogDescription>
            {session
              ? `Escolha o que a transmissão S${session.sequenceOrder} vai monitorar. Até vincular, ela existe na campanha mas não captura comentário nenhum.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLive && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">{SESSION_COPY.media.label}</Label>
              <Select onValueChange={setLiveId} value={liveId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={livesLoading ? "Carregando..." : "Selecione uma live"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {lives.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma live no ar agora
                    </div>
                  ) : (
                    lives.map((live) => {
                      const startTime = live.timestamp
                        ? format(new Date(live.timestamp), "HH:mm", { locale: ptBR })
                        : null
                      return (
                        <SelectItem key={live.id} value={live.id}>
                          Live @{live.username}
                          {startTime && ` (iniciada às ${startTime})`}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                A live precisa estar no ar para aparecer aqui. O LiveCart começa a monitorar
                os comentários assim que você vincula.
              </p>
            </div>
          )}

          {!isLive && !isStory && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">{SESSION_COPY.media.label}</Label>
              <InstagramMediaPicker
                enabled={open}
                selected={selectedMedia}
                onSelect={setSelectedMedia}
              />
            </div>
          )}

          {isStory && (
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">{SESSION_COPY.storyNoLink}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !mediaId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Vinculando..." : "Vincular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
