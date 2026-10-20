"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { trackMarketingEvent } from "@/lib/marketing/analytics"
import { APP_ORIGIN } from "@/lib/marketing/routes"

export function MarketingAnalytics() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname
      trackMarketingEvent("lc_marketing_view", { page_path: pathname })
    }
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>("a[href]")
      if (!link) return
      const target = new URL(link.href, window.location.origin)
      if (target.pathname !== "/register" || ![window.location.origin, APP_ORIGIN].includes(target.origin)) return
      trackMarketingEvent("lc_trial_click", { page_path: pathname, placement: link.dataset.marketingCta ?? "navigation" })
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [pathname])
  return null
}
