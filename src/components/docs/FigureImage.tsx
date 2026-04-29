"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.5

export interface FigureImageProps {
  src: string
  alt: string
  caption?: string
}

// Inline screenshot in a doc page. Click opens a fullscreen zoom dialog with
// pan + scroll-wheel zoom + toolbar (zoom in/out, reset, close).
export function FigureImage({ src, alt, caption }: FigureImageProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <figure className="space-y-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden rounded-lg border bg-muted/30 transition-shadow hover:shadow-md"
          aria-label="Ampliar imagem"
        >
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={900}
            className="h-auto w-full"
            unoptimized
          />
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" />
            Clique para ampliar
          </span>
        </button>
        {caption && (
          <figcaption className="px-1 text-xs italic text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>

      <ImageZoomDialog
        src={src}
        alt={alt}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

interface ImageZoomDialogProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ImageZoomDialog({ src, alt, open, onOpenChange }: ImageZoomDialogProps) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  // Drag origin tracked in a ref so mousemove handlers don't depend on stale
  // state — they read the latest pointer offset directly.
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null)

  // Reset transform every time the dialog reopens so the user starts at 100%.
  useEffect(() => {
    if (open) {
      setScale(1)
      setPos({ x: 0, y: 0 })
      setDragging(false)
      dragOriginRef.current = null
    }
  }, [open])

  // Keyboard shortcuts: + / − / 0 (and ESC handled by Radix).
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        zoomIn()
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        zoomOut()
      } else if (e.key === "0") {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // zoomIn/zoomOut/reset are stable refs to the same logic; deps left empty
    // intentionally to avoid re-binding on every state tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const zoomIn = () =>
    setScale((s) => Math.min(MAX_SCALE, +(s + ZOOM_STEP).toFixed(2)))
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(MIN_SCALE, +(s - ZOOM_STEP).toFixed(2))
      if (next === MIN_SCALE) setPos({ x: 0, y: 0 })
      return next
    })
  const reset = () => {
    setScale(1)
    setPos({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    e.preventDefault()
    setDragging(true)
    dragOriginRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragOriginRef.current) return
    setPos({
      x: e.clientX - dragOriginRef.current.x,
      y: e.clientY - dragOriginRef.current.y,
    })
  }

  const stopDrag = () => {
    setDragging(false)
    dragOriginRef.current = null
  }

  const handleWheel = (e: React.WheelEvent) => {
    // Only intercept the wheel when the user is actively zooming inside the
    // dialog. Vertical scroll outside the image remains the platform default
    // (the dialog itself handles it).
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    setScale((s) => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, +(s + delta).toFixed(2)))
      if (next === MIN_SCALE) setPos({ x: 0, y: 0 })
      return next
    })
  }

  const cursor = scale > 1 ? (dragging ? "grabbing" : "grab") : "default"
  const canZoomIn = scale < MAX_SCALE
  const canZoomOut = scale > MIN_SCALE
  const canReset = scale !== 1 || pos.x !== 0 || pos.y !== 0

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 flex h-[90vh] max-h-[90vh] w-[95vw] max-w-[95vw] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl border-0 bg-black/95 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">
            {alt || "Imagem ampliada"}
          </DialogPrimitive.Title>

        {/* Toolbar */}
        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-white/10 bg-black/70 p-1 shadow-lg backdrop-blur">
          <ToolbarButton
            label="Diminuir zoom"
            onClick={zoomOut}
            disabled={!canZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </ToolbarButton>
          <span className="min-w-[3.5rem] px-1 text-center text-xs font-medium tabular-nums text-white/90">
            {Math.round(scale * 100)}%
          </span>
          <ToolbarButton
            label="Aumentar zoom"
            onClick={zoomIn}
            disabled={!canZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />
          <ToolbarButton label="Restaurar" onClick={reset} disabled={!canReset}>
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />
          <ToolbarButton
            label="Fechar"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Pannable image area. Clicks on the dark backdrop (not on the
            image itself) close the dialog when at 100% zoom — when zoomed in
            the user is examining details, so we keep the dialog open. */}
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden"
          style={{ cursor }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onWheel={handleWheel}
          onClick={(e) => {
            if (e.target === e.currentTarget && scale === 1) {
              onOpenChange(false)
            }
          }}
        >
          {/* Plain <img> here — Next/Image with transform is finicky and the
              whole point is to render the original-resolution asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={cn(
              "max-h-full max-w-full select-none transition-transform",
              dragging ? "duration-0" : "duration-150"
            )}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: "center",
            }}
          />
        </div>

        {/* Hint at the bottom */}
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/70 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
          Roda do mouse: zoom · arraste: mover · clique fora da imagem: fechar
        </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

interface ToolbarButtonProps {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolbarButton({ label, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}
