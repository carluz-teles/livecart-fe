"use client"

import { useEffect, useState } from "react"
import { previewEventEnd } from "@/lib/event-deadline"
import type { Event } from "@/types/event.types"

export function useEventEndPreview(event: Event, open: boolean) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    if (!open) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [open])

  return previewEventEnd(event, now)
}
