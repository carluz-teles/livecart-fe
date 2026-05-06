"use client"

import { ArrowLeft, Phone, Video } from "lucide-react"

interface InstagramPreviewHeaderProps {
  storeName: string
  storeInitials: string
}

export function InstagramPreviewHeader({
  storeName,
  storeInitials,
}: InstagramPreviewHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 pt-2 pb-2.5 border-b border-[#DBDBDB]">
      <ArrowLeft className="h-5 w-5 text-[#262626]" strokeWidth={2} />
      <div className="story-ring h-9 w-9">
        <div className="story-ring-inner h-full w-full">
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-[10px] font-bold text-white"
          >
            {storeInitials}
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[14px] font-semibold leading-tight text-[#262626]">
            {storeName}
          </span>
          <svg
            className="h-3 w-3 text-[#0095F6]"
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
      <Phone className="h-5 w-5 text-[#262626]" strokeWidth={1.6} />
      <Video className="h-5 w-5 text-[#262626]" strokeWidth={1.6} />
    </div>
  )
}
