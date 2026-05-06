"use client"

import { Wifi } from "lucide-react"

import { InstagramPreviewHeader } from "./InstagramPreview.Header"
import { InstagramPreviewProfile } from "./InstagramPreview.Profile"
import { InstagramPreviewBubble } from "./InstagramPreview.Bubble"
import { InstagramPreviewComposer } from "./InstagramPreview.Composer"

import "./instagram-preview.css"

interface InstagramPreviewProps {
  storeName: string
  message: string
}

function getInitials(name: string) {
  if (!name) return "ML"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function InstagramPreview({ storeName, message }: InstagramPreviewProps) {
  const initials = getInitials(storeName)

  return (
    <div
      className="relative mx-auto rounded-[44px] p-[3px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.35)]"
      style={{
        width: 300,
        background:
          "linear-gradient(145deg, #2a2a2c 0%, #0a0a0a 100%)",
      }}
    >
      <div className="relative overflow-hidden rounded-[42px] bg-white">
        <div className="ig-dynamic-island" />

        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-semibold text-[#262626]">
          <span>9:41</span>
          <div className="mr-2 flex items-center gap-1">
            <Wifi className="h-3 w-3" strokeWidth={2.5} />
            <svg viewBox="0 0 24 12" fill="none" className="h-3 w-5" aria-hidden>
              <rect
                x="0.5"
                y="0.5"
                width="20"
                height="11"
                rx="2.5"
                stroke="currentColor"
              />
              <rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="currentColor" />
              <rect x="21.5" y="4" width="2" height="4" rx="1" fill="currentColor" />
            </svg>
          </div>
        </div>

        <InstagramPreviewHeader storeName={storeName || "minhaloja"} storeInitials={initials} />

        <div className="flex flex-col bg-white px-3 py-3" style={{ minHeight: 380 }}>
          <InstagramPreviewProfile storeName={storeName || "minhaloja"} storeInitials={initials} />
          <div className="mb-2 flex justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E8E]">
              agora
            </span>
          </div>
          <InstagramPreviewBubble storeInitials={initials} text={message} />
        </div>

        <InstagramPreviewComposer />

        <div className="flex justify-center pt-1 pb-1.5">
          <div className="h-1 w-24 rounded-full bg-black" />
        </div>
      </div>
    </div>
  )
}

InstagramPreview.Header = InstagramPreviewHeader
InstagramPreview.Profile = InstagramPreviewProfile
InstagramPreview.Bubble = InstagramPreviewBubble
InstagramPreview.Composer = InstagramPreviewComposer

export { InstagramPreview }
