"use client"

import { useState } from "react"
import { ChevronRight, Instagram, Plus, Radio } from "lucide-react"
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

type Choice = "live" | "post"

/**
 * Single entry point to create an event. Opens a chooser dialog (Live vs Post),
 * then defers to the matching form. Keeps one "Novo Evento" button in the header.
 */
export function EventTypeChooser() {
  const [chooserOpen, setChooserOpen] = useState(false)
  const [choice, setChoice] = useState<Choice | null>(null)

  const pick = (next: Choice) => {
    setChooserOpen(false)
    setChoice(next)
  }

  return (
    <>
      <Button onClick={() => setChooserOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Evento
      </Button>

      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Criar evento</DialogTitle>
            <DialogDescription>
              Escolha como você vai vender desta vez.
            </DialogDescription>
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
              onClick={() => pick("post")}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Live form — open immediately, render the trigger as null. */}
      {choice === "live" && (
        <EventForm
          open
          trigger={null}
          onOpenChange={(o) => {
            if (!o) setChoice(null)
          }}
        />
      )}

      {/* Post form — controlled open so it appears right after the choice. */}
      {choice === "post" && (
        <PostEventForm open trigger={null} onClose={() => setChoice(null)} />
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
