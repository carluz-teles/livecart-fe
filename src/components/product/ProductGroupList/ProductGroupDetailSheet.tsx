"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, Layers, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAddProductGroupImage,
  useProductGroup,
  useRemoveProductGroupImage,
} from "@/hooks/product-group"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { ProductGroupImage } from "@/types"

interface ProductGroupDetailSheetProps {
  groupId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductGroupDetailSheet({
  groupId,
  open,
  onOpenChange,
}: ProductGroupDetailSheetProps) {
  const { data, isLoading, error } = useProductGroup(groupId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {data?.name ?? "Grupo de variações"}
          </SheetTitle>
          <SheetDescription>
            {data?.description || "Variações do grupo, opções e galeria."}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !data ? (
          <p className="mt-6 text-sm text-destructive">
            Não foi possível carregar o grupo.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Options */}
            <section className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Opções
              </h4>
              <ul className="space-y-2">
                {data.options.map((opt) => (
                  <li
                    key={opt.id}
                    className="rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <p className="text-sm font-medium">{opt.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {opt.values.map((v) => (
                        <Badge key={v.id} variant="secondary" className="text-xs">
                          {v.value}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <GroupGallerySection groupId={data.id} images={data.groupImages} />

            <Separator />

            {/* Variants */}
            <section className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Variantes ({data.variants.length})
              </h4>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Combinação</TableHead>
                      <TableHead className="font-mono text-xs">Keyword</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead>SKU</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.variants.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {v.optionValues.map((ov, i) => (
                              <span
                                key={i}
                                className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-xs"
                              >
                                {ov.value}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          #{v.keyword}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(v.price)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {v.stock}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {v.sku || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <p className="text-xs text-muted-foreground">
              Criado em {formatDateTime(data.createdAt)}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// =============================================================================
// Gallery section — adds, lists, and removes group images. Uses optimistic
// invalidation rather than optimistic update because the backend sets
// position server-side; the round trip is cheap.
// =============================================================================

interface GroupGallerySectionProps {
  groupId: string
  images: ProductGroupImage[]
}

function GroupGallerySection({ groupId, images }: GroupGallerySectionProps) {
  const [draftUrl, setDraftUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const addImage = useAddProductGroupImage()
  const removeImage = useRemoveProductGroupImage()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const url = draftUrl.trim()
    if (!url) return
    setError(null)
    addImage.mutate(
      { groupId, payload: { url } },
      {
        onSuccess: () => {
          toast.success("Imagem adicionada")
          setDraftUrl("")
        },
        onError: (err) => {
          setError(err.message || "Falha ao adicionar imagem")
        },
      }
    )
  }

  const handleRemove = (imageId: string) => {
    setRemovingId(imageId)
    removeImage.mutate(
      { groupId, imageId },
      {
        onSuccess: () => {
          toast.success("Imagem removida")
        },
        onError: (err) =>
          toast.error("Falha ao remover", {
            description: err.message || "Tente novamente.",
          }),
        onSettled: () => setRemovingId(null),
      }
    )
  }

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Galeria</h4>

      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma imagem adicionada ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {images.map((img) => {
            const removing = removingId === img.id && removeImage.isPending
            return (
              <li
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="120px"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  disabled={removing}
                  aria-label="Remover imagem"
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait"
                >
                  {removing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="url"
          placeholder="https://... (URL da imagem)"
          value={draftUrl}
          onChange={(e) => {
            setDraftUrl(e.target.value)
            if (error) setError(null)
          }}
          className="h-9 text-sm"
          aria-invalid={!!error}
          disabled={addImage.isPending}
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!draftUrl.trim() || addImage.isPending}
        >
          {addImage.isPending && (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          )}
          Adicionar
        </Button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </section>
  )
}
