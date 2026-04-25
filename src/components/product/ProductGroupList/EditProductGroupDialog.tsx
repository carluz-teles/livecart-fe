"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateProductGroup } from "@/hooks/product-group"
import type { ProductGroupListItem } from "@/types"

interface EditProductGroupDialogProps {
  group: ProductGroupListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProductGroupDialog({
  group,
  open,
  onOpenChange,
}: EditProductGroupDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const updateGroup = useUpdateProductGroup()

  // Hydrate inputs whenever a different group is loaded into the dialog.
  useEffect(() => {
    if (group) {
      setName(group.name)
      setDescription(group.description ?? "")
      setError(null)
    }
  }, [group])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!group) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Nome é obrigatório")
      return
    }

    updateGroup.mutate(
      {
        id: group.id,
        payload: {
          name: trimmedName,
          // Send empty string to clear, not undefined — backend treats them
          // differently (omit = no change vs explicit empty = set to empty).
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Grupo atualizado")
          onOpenChange(false)
        },
        onError: (err) => {
          setError(err.message || "Falha ao salvar")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar grupo</DialogTitle>
            <DialogDescription>
              Atualize o nome e a descrição. Para mexer em opções ou variantes,
              edite cada variante individualmente na aba Todos os SKUs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(null)
                }}
                maxLength={200}
                aria-invalid={!!error}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Descrição</Label>
              <Textarea
                id="group-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Opcional"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateGroup.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateGroup.isPending}>
              {updateGroup.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
