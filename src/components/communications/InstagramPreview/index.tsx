"use client"

import {
  ArrowLeft,
  Camera,
  Heart,
  Image as ImageIcon,
  Mic,
  Phone,
  Video,
} from "lucide-react"

import { cn } from "@/lib/utils"

import "./instagram-preview.css"

interface InstagramPreviewProps {
  storeName: string
  message: string
}

function getInitials(name: string) {
  if (!name) return "LC"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "LC"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function InstagramPreview({ storeName, message }: InstagramPreviewProps) {
  const displayName = storeName?.trim() || "minhaloja"
  const initials = getInitials(displayName)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight">Prévia</h2>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Como aparece na DM
        </span>
      </div>

      {/* Instagram chat frame — mirrors EmailEditor.Preview's structure but
          dressed as an IG Direct conversation. Theme-locked to light via
          .instagram-preview-frame so the widget renders identically in light
          and dark dashboard modes. */}
      <div
        className={cn(
          "instagram-preview-frame group relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card",
          "shadow-[0_30px_60px_-30px_rgba(15,23,42,0.35),0_8px_20px_-12px_rgba(15,23,42,0.18)]",
        )}
      >
        {/* IG brand strip — pink/orange gradient that says "Instagram" instantly. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] opacity-90"
        />

        {/* Chat header — IG Direct style */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#DBDBDB] bg-white px-4 py-3">
          <ArrowLeft className="h-5 w-5 text-[#262626]" strokeWidth={2} />
          <div className="story-ring h-9 w-9 shrink-0">
            <div className="story-ring-inner h-full w-full">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-[10px] font-bold text-white">
                {initials}
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-[14px] font-semibold leading-tight text-[#262626]">
                {displayName}
              </span>
              <svg
                className="h-3 w-3 shrink-0 text-[#0095F6]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2 9.6 4.4l-3.4-.4-1 3.3-3.2 1.3 1 3.4-1 3.4 3.2 1.3 1 3.3 3.4-.4L12 22l2.4-2.4 3.4.4 1-3.3 3.2-1.3-1-3.4 1-3.4-3.2-1.3-1-3.3-3.4.4L12 2zm-1.4 13.6L7 12l1.4-1.4 2.2 2.2 5-5L17 9.2l-6.4 6.4z" />
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight text-[#8E8E8E]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Ativo agora</span>
            </div>
          </div>
          <Phone className="h-5 w-5 shrink-0 text-[#262626]" strokeWidth={1.6} />
          <Video className="h-5 w-5 shrink-0 text-[#262626]" strokeWidth={1.6} />
        </div>

        {/* Chat backdrop — the message bubble floats here. */}
        <div className="instagram-preview-backdrop relative min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* Profile card — IG shows this when you open a new conversation. */}
          <div className="mb-6 flex flex-col items-center">
            <div className="story-ring mb-2 h-16 w-16">
              <div className="story-ring-inner h-full w-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-[18px] font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
            <div className="text-[14px] font-semibold text-[#262626]">
              {displayName}
            </div>
            <div className="mt-0.5 text-[11px] text-[#8E8E8E]">
              Conta comercial
            </div>
            <button
              type="button"
              className="mt-2 rounded-md bg-[#EFEFEF] px-3 py-1 text-[12px] font-semibold text-[#262626]"
            >
              Ver loja
            </button>
          </div>

          {/* Timestamp pill */}
          <div className="mb-3 flex justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E8E]">
              agora
            </span>
          </div>

          {/* Message bubble */}
          <div className="flex items-end gap-2">
            <div className="story-ring mb-0.5 h-7 w-7 shrink-0">
              <div className="story-ring-inner h-full w-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-[8px] font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
            <div className="max-w-[78%] whitespace-pre-line rounded-[22px] rounded-bl-[6px] bg-white px-4 py-2.5 text-[14px] leading-[1.4] text-[#262626] shadow-sm ring-1 ring-black/5">
              {message || (
                <span className="italic text-[#8E8E8E]">
                  Comece a digitar pra ver a prévia.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Composer — decorative, mirrors IG's input row. */}
        <div className="flex shrink-0 items-center gap-2 border-t border-[#DBDBDB] bg-white px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0095F6] to-[#00376B]">
            <Camera className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[#DBDBDB] bg-white px-3.5 py-1.5">
            <span className="flex-1 truncate text-[13px] text-[#8E8E8E]">
              Mensagem...
            </span>
            <Mic className="h-4 w-4 shrink-0 text-[#262626]" strokeWidth={1.8} />
          </div>
          <ImageIcon
            className="h-5 w-5 shrink-0 text-[#262626]"
            strokeWidth={1.6}
          />
          <Heart
            className="h-5 w-5 shrink-0"
            strokeWidth={1.6}
            style={{ color: "#FF3040", fill: "#FF3040" }}
          />
        </div>
      </div>

      <p className="shrink-0 px-1 text-[11px] leading-relaxed text-muted-foreground">
        No envio real, a mensagem é entregue pelo Instagram Direct. Esta é uma
        simulação do que o cliente vê na conversa.
      </p>
    </div>
  )
}
