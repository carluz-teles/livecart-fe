"use client"

import { useState } from "react"
import {
  Aperture,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Instagram,
  LayoutGrid,
  Plus,
  Radio,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EventForm } from "./EventForm"
import { PostEventForm } from "./PostEventForm"
import { CreatePostForm } from "./CreatePostForm"

type Choice = "campaign" | "live" | "select-post" | "create-post" | "create-story"
type Step = "root" | "post"

/**
 * Porta de entrada da criação.
 *
 * O que ela fazia de errado: perguntava "live, post ou story?" ANTES de a
 * campanha existir. A resposta virava o tipo da PRIMEIRA SESSÃO, então
 * funcionava — mas ensinava que evento é uma publicação. E como três dos
 * quatro caminhos produziam uma campanha só de publicação, a própria UI passava
 * a se declarar incapaz de receber outra transmissão. Foi assim que o dono do
 * produto criou um evento, abriu, e leu a métrica de um post.
 *
 * O que muda: o primeiro card é a CAMPANHA — nome, janela, regras do carrinho,
 * transmissões depois. Os caminhos de publicação continuam existindo, com os
 * MESMOS rótulos e os mesmos cliques (o roteiro do App Review da Meta grava
 * "Novo Evento" > "Evento de post" > "Criar um post" e "Novo Evento" > "Criar
 * um Story"), agrupados e rotulados como o que sempre foram: atalhos que criam
 * campanha e primeira transmissão de uma vez.
 */
export function EventTypeChooser() {
  const [chooserOpen, setChooserOpen] = useState(false)
  const [step, setStep] = useState<Step>("root")
  const [choice, setChoice] = useState<Choice | null>(null)

  const openChooser = () => {
    setStep("root")
    setChooserOpen(true)
  }

  const pick = (next: Choice) => {
    setChooserOpen(false)
    setStep("root")
    setChoice(next)
  }

  return (
    <>
      <Button onClick={openChooser}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Evento
      </Button>

      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent className="sm:max-w-[520px]">
          {step === "root" ? (
            <>
              <DialogHeader>
                <DialogTitle>Criar evento</DialogTitle>
                <DialogDescription>
                  Um evento é a sua campanha — a live, o post, o reel e o story cabem
                  dentro dele, com um carrinho único por cliente.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 pt-2">
                <ChooserCard
                  icon={<CalendarRange className="h-5 w-5 text-primary" />}
                  title="Criar uma campanha"
                  description="Dê nome, defina a janela e as regras do carrinho. As transmissões — live, post, reel, story — você adiciona depois, quantas quiser."
                  onClick={() => pick("campaign")}
                  highlight
                />

                <div className="flex items-center gap-2 pt-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Atalhos: publicar e já vender
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <p className="-mt-1 text-xs text-muted-foreground">
                  Criam a campanha e a primeira transmissão de uma vez. Você continua
                  podendo adicionar outras transmissões à mesma campanha depois.
                </p>

                <ChooserCard
                  icon={<Radio className="h-5 w-5 text-destructive" />}
                  title="Live ao vivo"
                  description="Capture comentários da sua transmissão ao vivo e monte os carrinhos em tempo real."
                  onClick={() => pick("live")}
                />
                <ChooserCard
                  icon={<Instagram className="h-5 w-5" />}
                  title="Evento de post"
                  description="Venda pelos comentários de um post do Instagram, com início e fim agendados."
                  onClick={() => setStep("post")}
                />
                <ChooserCard
                  icon={<Aperture className="h-5 w-5" />}
                  title="Criar um Story"
                  description="Publique um Story (foto ou vídeo). Fica 24h no ar e quem responder por DM compra na hora."
                  onClick={() => pick("create-story")}
                />
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <button
                  type="button"
                  onClick={() => setStep("root")}
                  className="mb-1 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </button>
                <DialogTitle>Evento de post</DialogTitle>
                <DialogDescription>
                  Use um post que você já tem ou crie um novo agora pelo LiveCart.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 pt-2">
                <ChooserCard
                  icon={<LayoutGrid className="h-5 w-5" />}
                  title="Selecionar um post"
                  description="Escolha um post já publicado na sua conta para começar a vender pelos comentários."
                  onClick={() => pick("select-post")}
                />
                <ChooserCard
                  icon={<ImagePlus className="h-5 w-5" />}
                  title="Criar um post"
                  description="Publique uma foto ou vídeo (Reels) pelo LiveCart e já configure a promoção em um passo só."
                  onClick={() => pick("create-post")}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* A campanha e o atalho de live abrem o MESMO formulário. A diferença é
          só o ponto de partida da primeira transmissão: quem entrou por "Live
          ao vivo" já quer conectar uma live, quem entrou por "Criar uma
          campanha" costuma decidir isso depois. */}
      {choice === "campaign" && (
        <EventForm open trigger={null} onOpenChange={(o) => !o && setChoice(null)} />
      )}
      {choice === "live" && (
        <EventForm
          open
          trigger={null}
          initialSessionType="live"
          onOpenChange={(o) => !o && setChoice(null)}
        />
      )}
      {choice === "select-post" && (
        <PostEventForm open trigger={null} onClose={() => setChoice(null)} />
      )}
      {choice === "create-post" && (
        <CreatePostForm open onClose={() => setChoice(null)} />
      )}
      {choice === "create-story" && (
        <CreatePostForm variant="story" open onClose={() => setChoice(null)} />
      )}
    </>
  )
}

function ChooserCard({
  icon,
  title,
  description,
  onClick,
  highlight = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50" +
        (highlight ? " border-primary/40 bg-primary/5" : "")
      }
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}
