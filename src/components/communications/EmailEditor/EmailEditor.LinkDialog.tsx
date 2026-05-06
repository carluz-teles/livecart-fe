"use client"

import { useEffect, useState } from "react"
import { Link2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialURL: string
  onApply: (url: string) => void
}

// Single dialog drives both "add link" and "edit link". When the merchant
// triggers the toolbar with a selection that already has a link, initialURL
// is non-empty and a "Remover" button appears. Empty URL on apply unsets.
export function EmailLinkDialog({
  open,
  onOpenChange,
  initialURL,
  onApply,
}: EmailLinkDialogProps) {
  const [url, setUrl] = useState(initialURL ?? "")

  useEffect(() => {
    if (open) setUrl(initialURL ?? "")
  }, [open, initialURL])

  const submit = () => {
    onApply(normalizeURL(url.trim()))
    onOpenChange(false)
  }

  const remove = () => {
    onApply("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialURL ? "Editar link" : "Inserir link"}</DialogTitle>
          <DialogDescription>
            Os links abrem em uma nova aba quando o cliente clicar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="link-url">URL</Label>
          <Input
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                submit()
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Adicionamos <span className="font-mono">https://</span> automaticamente se você esquecer.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {initialURL ? (
            <Button variant="ghost" onClick={remove} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Remover
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={!url.trim()}>
              <Link2 className="mr-1.5 h-4 w-4" />
              Aplicar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// normalizeURL adds https:// when the merchant typed a bare host, leaves
// mailto: and tel: alone, and keeps relative links untouched (rare in
// emails but conceivable for in-app sites).
function normalizeURL(input: string): string {
  if (!input) return ""
  if (/^(https?:|mailto:|tel:|\/)/.test(input)) return input
  return "https://" + input
}
