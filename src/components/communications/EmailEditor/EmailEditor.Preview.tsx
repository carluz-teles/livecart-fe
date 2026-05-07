"use client"

import {
  Archive,
  CornerUpLeft,
  CornerUpRight,
  Inbox,
  MoreHorizontal,
  Star,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface EmailPreviewProps {
  /** Subject line as the merchant types it. */
  subject: string
  /** HTML body the merchant is editing. */
  bodyHTML: string
  /** Store name — used as the "from" name and avatar initials. */
  storeName?: string
  /** Store slug — used to synthesize a from address (e.g. minhaloja@livecart.app). */
  storeSlug?: string
  /** Logged-in owner's email — what gets shown on the "to" line. */
  ownerEmail?: string
}

function getInitials(name: string) {
  if (!name) return "LC"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "LC"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EmailEditorPreview({
  subject,
  bodyHTML,
  storeName,
  storeSlug,
  ownerEmail,
}: EmailPreviewProps) {
  const displayName = storeName?.trim() || "Sua loja"
  const initials = getInitials(displayName)
  const fromAddress = storeSlug
    ? `${storeSlug}@livecart.app`
    : "no-reply@livecart.app"
  const toAddress = ownerEmail || "voce@suaempresa.com"
  const displaySubject = subject.trim() || "Pedido #1234 · Sua loja"
  const timestamp = formatTimestamp(new Date())

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight">Prévia</h2>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Como aparece no inbox
        </span>
      </div>

      {/* Light email-client frame. The whole widget is theme-locked to light
          via .email-preview-frame so the preview reads identically regardless
          of the dashboard theme. */}
      <div
        className={cn(
          "email-preview-frame group relative overflow-hidden rounded-2xl border bg-card",
          "shadow-[0_30px_60px_-30px_rgba(15,23,42,0.35),0_8px_20px_-12px_rgba(15,23,42,0.18)]",
        )}
      >
        {/* Brand accent strip */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 opacity-90"
        />

        {/* Window chrome — light Mac-style */}
        <div className="flex items-center gap-3 border-b bg-muted px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-2 rounded-md border bg-background/90 px-3 py-1 text-[11px] text-muted-foreground">
            <Inbox className="h-3 w-3" strokeWidth={2.25} />
            <span className="font-medium">Caixa de entrada</span>
            <span className="text-muted-foreground/60">/ {displayName}</span>
          </div>
          <span className="h-3.5 w-3.5" aria-hidden />
        </div>

        {/* Toolbar — pure decoration */}
        <div className="flex items-center gap-1 border-b bg-muted/60 px-3 py-1.5 text-muted-foreground">
          <ToolbarButton icon={Archive} label="Arquivar" />
          <ToolbarButton icon={Trash2} label="Excluir" />
          <span className="mx-1 h-4 w-px bg-border" />
          <ToolbarButton icon={CornerUpLeft} label="Responder" />
          <ToolbarButton icon={CornerUpRight} label="Encaminhar" />
          <span className="ml-auto" />
          <ToolbarButton icon={MoreHorizontal} label="Mais" />
        </div>

        {/* Backdrop — the email "paper" floats over this with strong elevation. */}
        <div className="email-preview-backdrop relative px-6 py-8 sm:px-10 sm:py-12">
          <article
            className={cn(
              "relative overflow-hidden rounded-xl bg-white",
              "shadow-[0_30px_60px_-15px_rgba(15,23,42,0.22),0_12px_24px_-10px_rgba(15,23,42,0.14)]",
              "ring-1 ring-black/5",
            )}
          >
            {/* Email header */}
            <header className="flex items-start gap-3 border-b border-slate-200/80 px-6 pt-6 pb-5">
              <div
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[13px] font-semibold text-white shadow-sm ring-1 ring-black/5"
              >
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[18px] font-semibold leading-snug tracking-tight text-slate-900">
                  {displaySubject}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px]">
                  <span className="font-medium text-slate-900">{displayName}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    &lt;{fromAddress}&gt;
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  para{" "}
                  <span className="font-mono text-[11px] text-slate-600">
                    {toAddress}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5 text-[11px] text-slate-500">
                <span>hoje, {timestamp}</span>
                <Star className="h-3.5 w-3.5 text-slate-300" strokeWidth={2} />
              </div>
            </header>

            {/* Body */}
            <div className="px-6 py-7 sm:px-8 sm:py-9">
              {bodyHTML.trim() ? (
                <div
                  className="email-editor-content text-[15px] leading-[1.65] text-slate-900"
                  dangerouslySetInnerHTML={{ __html: bodyHTML }}
                />
              ) : (
                <p className="text-[14px] italic leading-relaxed text-slate-400">
                  Vazio: usaremos o template padrão da LiveCart.
                </p>
              )}

              {/* Signature divider */}
              <div className="mt-10 border-t border-dashed border-slate-200 pt-5 text-[12px] leading-relaxed text-slate-400">
                <p className="font-medium text-slate-500">{displayName}</p>
                <p>Enviado via LiveCart</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        No envio real, o email é entregue dentro de um shell com o logo da loja
        e rodapé. Esta é uma simulação do que o cliente verá no inbox.
      </p>
    </div>
  )
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
}

function ToolbarButton({ icon: Icon, label }: ToolbarButtonProps) {
  return (
    <span
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/80"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </span>
  )
}
