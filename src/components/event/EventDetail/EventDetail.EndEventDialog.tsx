"use client"

import { use } from "react"
import { RefreshCw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailEndEventDialog() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { endEventOpen } = ctx.state
  const { setEndEventOpen, endEvent, isEndingEvent } = ctx.actions

  return (
    <AlertDialog open={endEventOpen} onOpenChange={setEndEventOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar evento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja finalizar este evento? Todas as sessões
            ativas serão encerradas e os carrinhos serão finalizados. Links de
            checkout serão enviados automaticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isEndingEvent}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={endEvent}
            disabled={isEndingEvent}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isEndingEvent ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Finalizando…
              </>
            ) : (
              "Finalizar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
