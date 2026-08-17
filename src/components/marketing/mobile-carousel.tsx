"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MobileCarouselProps {
  /** classes do container de scroll (flex/grid/gap/overflow…) */
  className?: string
  /** classes do wrapper externo (ex.: mt-16) */
  wrapperClassName?: string
  children: React.ReactNode
}

/**
 * Grid no desktop, carrossel com scroll-snap no mobile (1 card por vez,
 * ocupando o container inteiro). As setas ficam ABAIXO do carrossel, apenas
 * no mobile, e habilitam/desabilitam conforme há mais conteúdo para os lados.
 */
export function MobileCarousel({
  className,
  wrapperClassName,
  children,
}: MobileCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [update])

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" })
  }

  const btn =
    "flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-accent disabled:opacity-40 disabled:hover:bg-background"

  return (
    <div className={wrapperClassName}>
      <div ref={ref} className={className}>
        {children}
      </div>

      {/* setas abaixo do carrossel (apenas mobile) */}
      <div className="mt-6 flex justify-center gap-3 sm:hidden">
        <button
          type="button"
          aria-label="Ver anterior"
          onClick={() => scroll(-1)}
          disabled={!canPrev}
          className={btn}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Ver próximo"
          onClick={() => scroll(1)}
          disabled={!canNext}
          className={btn}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}
