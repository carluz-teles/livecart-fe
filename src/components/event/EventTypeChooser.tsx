"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Instagram,
  LayoutGrid,
  Plus,
  Radio,
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

type Choice = "live" | "select-post" | "create-post"
type Step = "root" | "post"

/**
 * Single entry point to create an event. Opens a chooser dialog (Live vs Post),
 * and for Post a second step (select an existing post vs create a new one),
 * then defers to the matching form.
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
        <DialogContent className="sm:max-w-[480px]">
          {step === "root" ? (
            <>
              <DialogHeader>
                <DialogTitle>Criar evento</DialogTitle>
                <DialogDescription>Escolha como você vai vender desta vez.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 pt-2">
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
                  description="Publique um novo post de foto pelo LiveCart e já configure a promoção em um passo só."
                  onClick={() => pick("create-post")}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {choice === "live" && (
        <EventForm open trigger={null} onOpenChange={(o) => !o && setChoice(null)} />
      )}
      {choice === "select-post" && (
        <PostEventForm open trigger={null} onClose={() => setChoice(null)} />
      )}
      {choice === "create-post" && (
        <CreatePostForm open onClose={() => setChoice(null)} />
      )}
    </>
  )
}

function ChooserCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
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
