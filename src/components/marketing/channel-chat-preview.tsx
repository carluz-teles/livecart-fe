import { ChevronLeft, Instagram, MessageCircle, Radio } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ChatPreviewMessage {
  side: "start" | "end"
  text: string
  emphasis?: boolean
}

interface ChannelChatPreviewProps {
  channel: "instagram" | "whatsapp" | "live"
  title: string
  subtitle?: string
  messages: ChatPreviewMessage[]
  className?: string
}

const channelStyles = {
  instagram: {
    icon: Instagram,
    avatarClass: "bg-gradient-to-br from-[#833AB4] to-[#F77737]",
    bubbleEndClass: "bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white",
  },
  whatsapp: {
    icon: MessageCircle,
    avatarClass: "bg-[#25D366]",
    bubbleEndClass: "bg-[#DCF8C6] text-neutral-900",
  },
  live: {
    icon: Radio,
    avatarClass: "bg-red-500",
    bubbleEndClass: "bg-amber-400 text-black",
  },
} as const

/**
 * Mockup ilustrativo de conversa (Instagram DM, WhatsApp ou comentários de
 * live). Não é uma gravação real — sempre exibe o selo "prévia ilustrativa"
 * para deixar isso claro ao usuário.
 */
export function ChannelChatPreview({
  channel,
  title,
  subtitle,
  messages,
  className,
}: ChannelChatPreviewProps) {
  const style = channelStyles[channel]
  const Icon = style.icon

  return (
    <div className={cn("relative mx-auto w-full max-w-[320px]", className)}>
      <div className="absolute -inset-6 rounded-[3rem] bg-amber-400/20 blur-3xl" aria-hidden />

      <div className="relative rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-2.5 shadow-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
            <ChevronLeft className="size-5 text-neutral-700" aria-hidden />
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-white",
                style.avatarClass
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-neutral-900">{title}</p>
              {subtitle && (
                <p className="truncate text-[11px] text-neutral-400">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Illustrative badge */}
          <p className="px-4 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            Prévia ilustrativa · não é uma gravação real
          </p>

          {/* Messages */}
          <div className="space-y-2.5 px-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug",
                  m.side === "start"
                    ? "rounded-bl-sm bg-neutral-100 text-neutral-800"
                    : cn("ml-auto rounded-br-sm", style.bubbleEndClass)
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
