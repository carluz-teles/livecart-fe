"use client"

import { Camera, Mic, Image as ImageIcon, Heart } from "lucide-react"

export function InstagramPreviewComposer() {
  return (
    <div className="flex items-center gap-2 border-t border-[#DBDBDB] bg-white px-2.5 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0095F6] to-[#00376B]">
        <Camera className="h-4 w-4 text-white" strokeWidth={2} />
      </div>
      <div className="flex flex-1 items-center gap-2 rounded-full border border-[#DBDBDB] bg-white px-3.5 py-1.5">
        <span className="flex-1 text-[13px] text-[#8E8E8E]">Mensagem...</span>
        <Mic className="h-4 w-4 text-[#262626]" strokeWidth={1.8} />
      </div>
      <ImageIcon className="h-5 w-5 shrink-0 text-[#262626]" strokeWidth={1.6} />
      <Heart
        className="h-5 w-5 shrink-0"
        strokeWidth={1.6}
        style={{ color: "#FF3040", fill: "#FF3040" }}
      />
    </div>
  )
}
