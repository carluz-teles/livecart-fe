"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Lock, Radio, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CheckoutHeaderProps {
  storeName: string
  logoUrl?: string | null
  isLiveActive?: boolean
}

export function CheckoutHeader({ storeName, logoUrl, isLiveActive }: CheckoutHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="relative overflow-hidden border-b border-gray-100 bg-white">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Logo and store info - centered with entrance animation */}
        <div
          className={cn(
            "flex flex-col items-center gap-4 transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {/* Live badge - stacked on mobile, absolute on desktop */}
          {isLiveActive && (
            <div
              className={cn(
                "md:absolute md:right-4 md:top-4 transition-all duration-700",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              )}
            >
              <Badge
                variant="destructive"
                className="relative gap-1.5 px-3 py-1.5 shadow-lg shadow-red-500/20"
              >
                {/* Pulse ring effect */}
                <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                <Radio className="h-3 w-3 animate-pulse" />
                <span className="font-medium">Live em andamento</span>
              </Badge>
            </div>
          )}
          {/* Logo with premium border */}
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gray-200 via-white to-gray-100 opacity-80" />

            {logoUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-xl shadow-gray-200/60">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-2xl font-bold text-white shadow-xl shadow-gray-300/50">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Store name with refined typography */}
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              {storeName}
            </h1>

            {/* Security badge with subtle styling */}
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-1.5 transition-all duration-700 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              <div className="flex items-center gap-1.5 text-gray-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Checkout Seguro</span>
              </div>
              <span className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1 text-gray-400">
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
