"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 1.4

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// Lightbox de imagem com zoom (scroll / botões / duplo-clique) e pan (arrastar
// quando ampliado). Sem dependências extras — usa o Dialog do Radix só para o
// portal, overlay escuro, focus-trap e Esc. object-contain garante que a
// imagem apareça inteira, sem o corte do card.
export function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const reset = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  // Reset ao abrir e ao trocar de imagem.
  useEffect(() => {
    if (open) reset()
  }, [open, src, reset])

  // Mantém o ponto sob o cursor fixo ao dar zoom.
  const zoomAt = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const el = containerRef.current
      const target = clamp(nextScale, MIN_SCALE, MAX_SCALE)
      setScale((current) => {
        if (target === current) return current
        if (target <= MIN_SCALE) {
          setOffset({ x: 0, y: 0 })
          return MIN_SCALE
        }
        if (el && clientX !== undefined && clientY !== undefined) {
          const rect = el.getBoundingClientRect()
          const cx = clientX - rect.left - rect.width / 2
          const cy = clientY - rect.top - rect.height / 2
          const ratio = target / current
          setOffset((o) => clampOffset({ x: cx - ratio * (cx - o.x), y: cy - ratio * (cy - o.y) }, target, el))
        }
        return target
      })
    },
    []
  )

  // Wheel com { passive: false } para poder previnir o scroll da página.
  useEffect(() => {
    const el = containerRef.current
    if (!el || !open) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
      zoomAt(scale * factor, e.clientX, e.clientY)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [open, scale, zoomAt])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= MIN_SCALE) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
      setDragging(true)
    },
    [scale, offset]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = dragRef.current
      const el = containerRef.current
      if (!start || !el) return
      setOffset(
        clampOffset({ x: start.ox + (e.clientX - start.x), y: start.oy + (e.clientY - start.y) }, scale, el)
      )
    },
    [scale]
  )

  const endDrag = useCallback(() => {
    dragRef.current = null
    setDragging(false)
  }, [])

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (scale > MIN_SCALE) reset()
      else zoomAt(2.5, e.clientX, e.clientY)
    },
    [scale, reset, zoomAt]
  )

  const canPan = scale > MIN_SCALE

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onEscapeKeyDown={() => onOpenChange(false)}
          className="fixed inset-0 z-50 flex items-center justify-center focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          {/* Área da imagem — clique fora fecha */}
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onDoubleClick={onDoubleClick}
            className={cn(
              "relative flex h-full w-full items-center justify-center overflow-hidden touch-none select-none",
              canPan ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            )}
            onClick={(e) => {
              // Clique no vazio (fora da imagem) fecha; na imagem, não.
              if (e.target === e.currentTarget) onOpenChange(false)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
              className={cn(
                "max-h-[90vh] max-w-[92vw] object-contain will-change-transform",
                !dragging && "transition-transform duration-150 ease-out motion-reduce:transition-none"
              )}
            />
          </div>

          {/* Toolbar de zoom */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 shadow-lg backdrop-blur">
            <ToolbarButton
              label="Diminuir zoom"
              onClick={() => zoomAt(scale / ZOOM_STEP)}
              disabled={scale <= MIN_SCALE}
            >
              <ZoomOut className="h-4 w-4" />
            </ToolbarButton>
            <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-white/80">
              {Math.round(scale * 100)}%
            </span>
            <ToolbarButton
              label="Aumentar zoom"
              onClick={() => zoomAt(scale * ZOOM_STEP)}
              disabled={scale >= MAX_SCALE}
            >
              <ZoomIn className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Redefinir" onClick={reset} disabled={scale === MIN_SCALE && offset.x === 0 && offset.y === 0}>
              <RotateCcw className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Fechar */}
          <DialogPrimitive.Close
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur transition-colors hover:bg-black/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// Limita o pan para a imagem não sumir da tela.
function clampOffset(o: { x: number; y: number }, scale: number, el: HTMLElement) {
  const maxX = ((scale - 1) * el.clientWidth) / 2
  const maxY = ((scale - 1) * el.clientHeight) / 2
  return { x: clamp(o.x, -maxX, maxX), y: clamp(o.y, -maxY, maxY) }
}

function ToolbarButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}
