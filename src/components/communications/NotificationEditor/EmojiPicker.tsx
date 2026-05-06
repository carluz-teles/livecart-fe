"use client"

import { Smile } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const RECENT = ["⏰", "🛒", "🛍️", "💛", "🔥", "✨", "💸", "🎁"]
const SMILEYS = [
  "😍", "🙌", "👇", "📦", "🚀", "⚡", "🌟", "💫",
  "😊", "🥰", "🤩", "🎉", "👋", "👏", "💪", "🙏",
  "❤️", "💝", "✅", "👌", "🛍", "🪄", "💎", "🎊",
]

interface EmojiPickerProps {
  onPick: (emoji: string) => void
}

export function EmojiPicker({ onPick }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5">
          <Smile className="h-4 w-4" />
          Emoji
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <Section title="Recentes" emojis={RECENT} onPick={onPick} />
        <Section title="Smileys & objetos" emojis={SMILEYS} onPick={onPick} />
      </PopoverContent>
    </Popover>
  )
}

function Section({
  title,
  emojis,
  onPick,
}: {
  title: string
  emojis: string[]
  onPick: (emoji: string) => void
}) {
  return (
    <div className="space-y-1.5 first:mb-3">
      <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-8 gap-1">
        {emojis.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => onPick(e)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
