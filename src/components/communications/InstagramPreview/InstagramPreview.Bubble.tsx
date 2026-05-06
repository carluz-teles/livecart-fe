"use client"

interface InstagramPreviewBubbleProps {
  storeInitials: string
  text: string
}

export function InstagramPreviewBubble({
  storeInitials,
  text,
}: InstagramPreviewBubbleProps) {
  return (
    <div className="flex items-end gap-1.5 mb-1">
      <div className="story-ring h-7 w-7 shrink-0 mb-0.5">
        <div className="story-ring-inner h-full w-full">
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-[8px] font-bold text-white"
          >
            {storeInitials}
          </div>
        </div>
      </div>
      <div className="max-w-[78%] whitespace-pre-line rounded-[22px] rounded-bl-[6px] bg-[#EFEFEF] px-3.5 py-2 text-[14px] leading-[1.35] text-[#262626]">
        {text || (
          <span className="text-[#8E8E8E] italic">Comece a digitar pra ver a prévia.</span>
        )}
      </div>
    </div>
  )
}
