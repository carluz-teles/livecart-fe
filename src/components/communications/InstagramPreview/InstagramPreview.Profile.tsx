"use client"

interface InstagramPreviewProfileProps {
  storeName: string
  storeInitials: string
  bio?: string
}

export function InstagramPreviewProfile({
  storeName,
  storeInitials,
  bio = "Conta comercial",
}: InstagramPreviewProfileProps) {
  return (
    <div className="flex flex-col items-center pt-3 pb-4">
      <div className="story-ring h-16 w-16 mb-2">
        <div className="story-ring-inner h-full w-full">
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-[18px] font-bold text-white"
          >
            {storeInitials}
          </div>
        </div>
      </div>
      <div className="text-[14px] font-semibold text-[#262626]">{storeName}</div>
      <div className="mt-0.5 text-[11px] text-[#8E8E8E]">{bio}</div>
      <button className="mt-2 rounded-md bg-[#EFEFEF] px-3 py-1 text-[12px] font-semibold text-[#262626]" type="button">
        Ver loja
      </button>
    </div>
  )
}
