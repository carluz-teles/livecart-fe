"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface NotificationEditorFooterProps {
  dirty: boolean
  saving: boolean
  onCancel: () => void
  onSave: () => void
}

export function NotificationEditorFooter({
  dirty,
  saving,
  onCancel,
  onSave,
}: NotificationEditorFooterProps) {
  return (
    <div className="sticky bottom-4 z-10 mt-4">
      <div className="flex items-center justify-between gap-3 rounded-md border bg-card/85 px-4 py-2.5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2.5 text-sm">
          {dirty ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-medium">Você tem alterações não salvas</span>
            </>
          ) : (
            <span className="text-muted-foreground">Tudo salvo</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={!dirty || saving}
          >
            Descartar
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
          >
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
