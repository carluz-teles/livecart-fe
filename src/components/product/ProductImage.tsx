"use client"

import { useState } from "react"
import Image from "next/image"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string | null
  fallbackSources?: string[]
  alt: string
  width: number
  height: number
  className?: string
  unoptimized?: boolean
}

export function ProductImage({ src, fallbackSources = [], ...props }: ProductImageProps) {
  const sources = [...new Set([src, ...fallbackSources].filter((url): url is string => !!url))]
  // A changed product or refreshed URL gets a fresh attempt. A failed URL is
  // never retried in a render loop, and candidates keep the ERP's order.
  return <ProductImageAttempt key={JSON.stringify(sources)} sources={sources} {...props} />
}

function ProductImageAttempt({ sources, alt, width, height, className, unoptimized = true }: Omit<ProductImageProps, "src" | "fallbackSources"> & { sources: string[] }) {
  const [index, setIndex] = useState(0)
  const source = sources[index]

  if (!source) {
    return (
      <span
        role="img"
        aria-label={alt ? `Imagem indisponível: ${alt}` : "Imagem indisponível"}
        title="Imagem indisponível"
        className={cn("inline-flex shrink-0 items-center justify-center rounded-md bg-muted", className)}
        style={{ width, height }}
      >
        <Package aria-hidden="true" className="h-1/2 w-1/2 text-muted-foreground" />
      </span>
    )
  }

  return (
    <Image
      key={source}
      src={source}
      alt={alt}
      width={width}
      height={height}
      unoptimized={unoptimized}
      className={className}
      onError={() => setIndex(index + 1)}
    />
  )
}
