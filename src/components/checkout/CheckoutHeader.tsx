import Image from "next/image"
import { Instagram, Lock, Radio, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CheckoutHeaderProps {
  storeName: string
  logoUrl?: string | null
  isLiveActive?: boolean
  isPost?: boolean
}

export function CheckoutHeader({ storeName, logoUrl, isLiveActive, isPost }: CheckoutHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-gray-100 bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="flex animate-in fade-in-0 slide-in-from-bottom-2 flex-col items-center gap-4 duration-700">
          {isLiveActive && isPost && (
            <div className="animate-in fade-in-0 slide-in-from-top-2 duration-700 md:absolute md:right-4 md:top-4">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 shadow-sm">
                <Instagram className="h-3 w-3" />
                <span className="font-medium">Promoção ativa</span>
              </Badge>
            </div>
          )}

          {isLiveActive && !isPost && (
            <div className="animate-in fade-in-0 slide-in-from-top-2 duration-700 md:absolute md:right-4 md:top-4">
              <Badge
                variant="destructive"
                className="relative gap-1.5 px-3 py-1.5 shadow-lg shadow-red-500/20"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                <Radio className="h-3 w-3 animate-pulse" />
                <span className="font-medium">Live em andamento</span>
              </Badge>
            </div>
          )}

          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gray-200 via-white to-gray-100 opacity-80" />

            {logoUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-xl shadow-gray-200/60">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  sizes="80px"
                  className="object-contain"
                  priority
                  fetchPriority="high"
                />
              </div>
            ) : (
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-2xl font-bold text-white shadow-xl shadow-gray-300/50">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              {storeName}
            </h1>

            <div className="mt-3 inline-flex animate-in fade-in-0 slide-in-from-bottom-1 items-center gap-2 rounded-full bg-gray-50 px-4 py-1.5 duration-700">
              <div className="flex items-center gap-1.5 text-gray-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Checkout Seguro</span>
              </div>
              <span className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1 text-gray-600">
                <Lock className="h-3 w-3" />
                <span className="text-xs">SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
